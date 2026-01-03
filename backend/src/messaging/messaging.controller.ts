import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Tenant } from '../tenant/tenant.decorator';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async sendMessage(
    @Body() body: { to: string; message: string },
    @Tenant() organizationId: string,
  ) {
    const success = await this.messagingService.sendMessage(
      body.to,
      body.message,
      organizationId,
    );
    return { success, message: success ? 'Mensagem enviada com sucesso' : 'Erro ao enviar mensagem' };
  }

  @Post('booking/:bookingId/confirm')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async sendBookingConfirmation(
    @Query('bookingId') bookingId: string,
    @Tenant() organizationId: string,
  ) {
    const success = await this.messagingService.sendBookingConfirmation(bookingId, organizationId);
    return { success, message: success ? 'Confirmação enviada' : 'Erro ao enviar confirmação' };
  }

  @Post('invoice/:invoiceId/notify')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async sendInvoiceNotification(
    @Query('invoiceId') invoiceId: string,
    @Tenant() organizationId: string,
  ) {
    const success = await this.messagingService.sendInvoiceNotification(invoiceId, organizationId);
    return { success, message: success ? 'Notificação enviada' : 'Erro ao enviar notificação' };
  }

  @Get('test')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async testConnection() {
    // Testa se o provider está configurado
    const provider = process.env.MESSAGING_PROVIDER || 'TWILIO';
    return {
      provider,
      configured: this.checkProviderConfig(provider),
      message: 'Verifique as variáveis de ambiente para o provider selecionado',
    };
  }

  private checkProviderConfig(provider: string): boolean {
    switch (provider) {
      case 'TWILIO':
        return !!(
          process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_WHATSAPP_FROM
        );
      case 'EVOLUTION_API':
        return !!(
          process.env.EVOLUTION_API_URL &&
          process.env.EVOLUTION_API_KEY &&
          process.env.EVOLUTION_INSTANCE_NAME
        );
      case 'WHATSAPP_BUSINESS':
        return !!(
          process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN
        );
      default:
        return false;
    }
  }
}
