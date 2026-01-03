import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

export enum MessagingProvider {
  TWILIO = 'TWILIO',
  EVOLUTION_API = 'EVOLUTION_API',
  WHATSAPP_BUSINESS = 'WHATSAPP_BUSINESS',
}

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);
  private provider: MessagingProvider;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Determina qual provider usar baseado nas variáveis de ambiente
    const providerEnv = this.configService.get<string>('MESSAGING_PROVIDER', 'TWILIO');
    this.provider = providerEnv as MessagingProvider;
  }

  /**
   * Envia uma mensagem WhatsApp para um número
   * @param to Número do destinatário (formato: 5511999999999 - com código do país, sem +)
   * @param message Texto da mensagem
   * @param organizationId ID da organização (para logs e histórico)
   */
  async sendMessage(to: string, message: string, organizationId?: string): Promise<boolean> {
    try {
      // Remove caracteres não numéricos e garante formato correto
      const cleanPhone = this.formatPhoneNumber(to);

      switch (this.provider) {
        case MessagingProvider.TWILIO:
          return await this.sendViaTwilio(cleanPhone, message);
        case MessagingProvider.EVOLUTION_API:
          return await this.sendViaEvolutionAPI(cleanPhone, message, organizationId);
        case MessagingProvider.WHATSAPP_BUSINESS:
          return await this.sendViaWhatsAppBusiness(cleanPhone, message, organizationId);
        default:
          this.logger.warn(`Provider ${this.provider} não implementado`);
          return false;
      }
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem WhatsApp: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Envia mensagem usando Twilio
   */
  private async sendViaTwilio(to: string, message: string): Promise<boolean> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const fromNumber = this.configService.get<string>('TWILIO_WHATSAPP_FROM');

    if (!accountSid || !authToken || !fromNumber) {
      this.logger.error('Configurações do Twilio não encontradas');
      return false;
    }

    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          From: `whatsapp:${fromNumber}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
        },
      );

      this.logger.log(`Mensagem enviada via Twilio: ${response.data.sid}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Erro ao enviar via Twilio: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  /**
   * Envia mensagem usando Evolution API
   */
  private async sendViaEvolutionAPI(
    to: string,
    message: string,
    organizationId?: string,
  ): Promise<boolean> {
    const evolutionApiUrl = this.configService.get<string>('EVOLUTION_API_URL');
    const evolutionApiKey = this.configService.get<string>('EVOLUTION_API_KEY');
    const instanceName = this.configService.get<string>('EVOLUTION_INSTANCE_NAME');

    if (!evolutionApiUrl || !evolutionApiKey || !instanceName) {
      this.logger.error('Configurações da Evolution API não encontradas');
      return false;
    }

    try {
      const response = await axios.post(
        `${evolutionApiUrl}/message/sendText/${instanceName}`,
        {
          number: to,
          text: message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            apikey: evolutionApiKey,
          },
        },
      );

      this.logger.log(`Mensagem enviada via Evolution API: ${response.data.key?.id}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Erro ao enviar via Evolution API: ${error.response?.data?.message || error.message}`,
      );
      return false;
    }
  }

  /**
   * Envia mensagem usando WhatsApp Business API (Meta)
   */
  private async sendViaWhatsAppBusiness(
    to: string,
    message: string,
    organizationId?: string,
  ): Promise<boolean> {
    const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');

    if (!phoneNumberId || !accessToken) {
      this.logger.error('Configurações do WhatsApp Business API não encontradas');
      return false;
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Mensagem enviada via WhatsApp Business: ${response.data.messages[0]?.id}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Erro ao enviar via WhatsApp Business: ${error.response?.data?.error?.message || error.message}`,
      );
      return false;
    }
  }

  /**
   * Formata número de telefone para formato internacional
   * Remove caracteres não numéricos e adiciona código do país se necessário
   */
  private formatPhoneNumber(phone: string): string {
    // Remove tudo exceto números
    let clean = phone.replace(/\D/g, '');

    // Se não começar com código do país (55 para Brasil), adiciona
    if (!clean.startsWith('55') && clean.length <= 11) {
      clean = '55' + clean;
    }

    return clean;
  }

  /**
   * Envia notificação de reserva confirmada
   */
  async sendBookingConfirmation(
    bookingId: string,
    organizationId: string,
  ): Promise<boolean> {
    try {
      const booking = await this.prisma.booking.findFirst({
        where: { id: bookingId, organizationId },
        include: {
          user: true,
          court: true,
        },
      });

      if (!booking || !booking.user.phone) {
        return false;
      }

      const date = new Date(booking.date).toLocaleDateString('pt-BR');
      const message = `✅ Reserva Confirmada!\n\n` +
        `Quadra: ${booking.court.name}\n` +
        `Data: ${date}\n` +
        `Horário: ${booking.startTime} - ${booking.endTime}\n\n` +
        `Obrigado por escolher nossos serviços!`;

      return await this.sendMessage(booking.user.phone, message, organizationId);
    } catch (error) {
      this.logger.error(`Erro ao enviar confirmação de reserva: ${error.message}`);
      return false;
    }
  }

  /**
   * Envia notificação de invoice gerada
   */
  async sendInvoiceNotification(
    invoiceId: string,
    organizationId: string,
  ): Promise<boolean> {
    try {
      const invoice = await this.prisma.invoice.findFirst({
        where: { id: invoiceId, organizationId },
        include: {
          user: true,
        },
      });

      if (!invoice || !invoice.user.phone) {
        return false;
      }

      const dueDate = new Date(invoice.dueDate).toLocaleDateString('pt-BR');
      const amount = Number(invoice.amount).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      const message = `📄 Nova Fatura Gerada\n\n` +
        `Descrição: ${invoice.description}\n` +
        `Valor: ${amount}\n` +
        `Vencimento: ${dueDate}\n\n` +
        `Por favor, realize o pagamento até a data de vencimento.`;

      return await this.sendMessage(invoice.user.phone, message, organizationId);
    } catch (error) {
      this.logger.error(`Erro ao enviar notificação de invoice: ${error.message}`);
      return false;
    }
  }

  /**
   * Envia notificação de lembrete de reserva
   */
  async sendBookingReminder(
    bookingId: string,
    organizationId: string,
  ): Promise<boolean> {
    try {
      const booking = await this.prisma.booking.findFirst({
        where: { id: bookingId, organizationId },
        include: {
          user: true,
          court: true,
        },
      });

      if (!booking || !booking.user.phone) {
        return false;
      }

      const date = new Date(booking.date).toLocaleDateString('pt-BR');
      const message = `⏰ Lembrete de Reserva\n\n` +
        `Sua reserva está agendada para:\n` +
        `Quadra: ${booking.court.name}\n` +
        `Data: ${date}\n` +
        `Horário: ${booking.startTime} - ${booking.endTime}\n\n` +
        `Nos vemos em breve!`;

      return await this.sendMessage(booking.user.phone, message, organizationId);
    } catch (error) {
      this.logger.error(`Erro ao enviar lembrete de reserva: ${error.message}`);
      return false;
    }
  }
}
