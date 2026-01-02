import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourtAvailabilityService } from '../courts/court-availability.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private availabilityService: CourtAvailabilityService,
  ) {}

  async create(data: CreateBookingDto, userId: string, organizationId: string) {
    // Valida se o horário está disponível
    // Parse da data no formato YYYY-MM-DD usando UTC para evitar problemas de timezone
    const [year, month, day] = data.date.split('-').map(Number);
    const bookingDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    const isAvailable = await this.availabilityService.isTimeSlotAvailable(
      data.courtId,
      bookingDate,
      data.startTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('Este horário não está disponível para reserva nesta quadra');
    }

    // Verifica se já existe uma reserva no mesmo horário
    // Usa UTC para manter consistência
    const dateStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dateEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        organizationId,
        courtId: data.courtId,
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
        startTime: data.startTime,
        status: {
          not: 'CANCELLED',
        },
      },
    });

    if (existingBooking) {
      throw new ConflictException('Já existe uma reserva para este horário');
    }

    // Calcula endTime (1 hora depois do startTime)
    const [hours, minutes] = data.startTime.split(':').map(Number);
    let endHours = hours + 1;
    let endMinutes = minutes;
    
    // Se passar de 24 horas, ajusta
    if (endHours >= 24) {
      endHours = endHours - 24;
    }
    
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

    return this.prisma.booking.create({
      data: {
        organizationId,
        userId,
        courtId: data.courtId,
        date: bookingDate, // Usa a data criada com UTC
        startTime: data.startTime,
        endTime,
        notes: data.notes,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        court: true,
      },
    });
  }

  async findAll(organizationId: string, filters?: any) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        organizationId,
        ...filters,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        court: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // Formata a data e adiciona informação sobre se é premium e o valor
    const bookingsWithPrice = await Promise.all(
      bookings.map(async (booking) => {
        const [year, month, day] = booking.date.toISOString().split('T')[0].split('-').map(Number);
        const bookingDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const dayOfWeek = bookingDate.getUTCDay();
        
        // Verifica se o horário é premium consultando a disponibilidade
        // Primeiro tenta buscar por data específica, depois por dia da semana
        const specificAvailability = await this.prisma.courtAvailability.findFirst({
          where: {
            courtId: booking.courtId,
            timeSlot: booking.startTime,
            specificDate: bookingDate,
          },
        });

        let availability = specificAvailability;
        if (!availability) {
          availability = await this.prisma.courtAvailability.findFirst({
            where: {
              courtId: booking.courtId,
              timeSlot: booking.startTime,
              dayOfWeek,
              specificDate: null,
            },
          });
        }

        const isPremium = availability?.isPremium || false;
        const price = isPremium && booking.court.premiumPrice
          ? Number(booking.court.premiumPrice)
          : booking.court.defaultPrice
          ? Number(booking.court.defaultPrice)
          : null;

        return {
          ...booking,
          date: booking.date.toISOString().split('T')[0],
          isPremium,
          price,
        };
      })
    );

    return bookingsWithPrice;
  }

  async findMyBookings(userId: string, organizationId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        organizationId,
        userId,
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        court: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // Formata a data e adiciona informação sobre se é premium e o valor
    const bookingsWithPrice = await Promise.all(
      bookings.map(async (booking) => {
        const [year, month, day] = booking.date.toISOString().split('T')[0].split('-').map(Number);
        const bookingDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const dayOfWeek = bookingDate.getUTCDay();
        
        // Verifica se o horário é premium consultando a disponibilidade
        // Primeiro tenta buscar por data específica, depois por dia da semana
        const specificAvailability = await this.prisma.courtAvailability.findFirst({
          where: {
            courtId: booking.courtId,
            timeSlot: booking.startTime,
            specificDate: bookingDate,
          },
        });

        let availability = specificAvailability;
        if (!availability) {
          availability = await this.prisma.courtAvailability.findFirst({
            where: {
              courtId: booking.courtId,
              timeSlot: booking.startTime,
              dayOfWeek,
              specificDate: null,
            },
          });
        }

        const isPremium = availability?.isPremium || false;
        const price = isPremium && booking.court.premiumPrice
          ? Number(booking.court.premiumPrice)
          : booking.court.defaultPrice
          ? Number(booking.court.defaultPrice)
          : null;

        return {
          ...booking,
          date: booking.date.toISOString().split('T')[0],
          isPremium,
          price,
        };
      })
    );

    return bookingsWithPrice;
  }

  async getAvailability(courtId: string, date: string, organizationId: string) {
    // Verifica se a quadra existe e pertence à organização
    const court = await this.prisma.court.findFirst({
      where: {
        id: courtId,
        organizationId,
        isActive: true,
      },
    });

    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }

    // Busca disponibilidade da quadra para a data
    const availability = await this.availabilityService.getAvailability(
      courtId,
      date,
    );

    // Busca reservas existentes para a data
    const [year, month, day] = date.split('-').map(Number);
    const dateStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dateEnd = new Date(dateStart);
    dateEnd.setUTCDate(dateEnd.getUTCDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        organizationId,
        courtId,
        date: {
          gte: dateStart,
          lt: dateEnd,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Combina disponibilidade e reservas
    // Primeiro tenta buscar disponibilidade específica para a data
    let availableSlots: string[] = [];
    let premiumSlots: string[] = [];

    if (availability.specificDates[date] && availability.specificDates[date].length > 0) {
      // Se houver disponibilidade específica para a data, usa ela
      availableSlots = availability.specificDates[date];
      premiumSlots = availability.premiumSpecificDates[date] || [];
    } else {
      // Se não houver disponibilidade específica, usa a recorrente do dia da semana
      // Calcula o dia da semana usando UTC para evitar problemas de timezone
      const dayOfWeek = dateStart.getUTCDay();
      availableSlots = availability.weekly[dayOfWeek] || [];
      premiumSlots = availability.premium[dayOfWeek] || [];
    }

    // Filtra horários que já passaram (apenas para data de hoje)
    // Compara a data usando UTC, mas usa horário de Brasília (UTC-3) para filtrar slots passados
    // pois os horários configurados são no horário local (Brasília)
    const now = new Date();
    
    // Converte UTC para horário de Brasília (UTC-3)
    // Se o servidor está em UTC, subtrai 3 horas para obter o horário de Brasília
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    
    // Calcula horário de Brasília (UTC-3)
    // Se for antes das 3h UTC, o horário de Brasília é do dia anterior (após meia-noite)
    let brasiliaHour = utcHour - 3;
    let brasiliaMinute = utcMinute;
    let brasiliaDateOffset = 0;
    
    // Ajusta se passar da meia-noite (horário negativo)
    if (brasiliaHour < 0) {
      brasiliaHour += 24;
      brasiliaDateOffset = -1; // Data de Brasília é do dia anterior
    }
    
    // Compara a data selecionada com a data atual em Brasília
    const todayBrasilia = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate() + brasiliaDateOffset, 
      0, 0, 0, 0
    ));
    const selectedDateOnly = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    // Se for hoje, remove horários que já terminaram
    // Usa horário de Brasília para comparar com os slots configurados
    if (selectedDateOnly.getTime() === todayBrasilia.getTime()) {
      const currentTimeMinutes = brasiliaHour * 60 + brasiliaMinute;
      
      console.log(`🕐 Filtragem de horários - UTC: ${utcHour}:${String(utcMinute).padStart(2, '0')}, Brasília: ${brasiliaHour}:${String(brasiliaMinute).padStart(2, '0')}, Minutos totais: ${currentTimeMinutes}`);

      availableSlots = availableSlots.filter((timeSlot) => {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const slotTimeMinutes = hours * 60 + minutes;
        // Um horário termina 1 hora depois do início
        // Exemplo: 17:00 termina às 18:00, 17:30 termina às 18:30
        const slotEndMinutes = slotTimeMinutes + 60;
        
        // Mantém o horário se ainda não terminou
        // Se são 18:43 (Brasília), 18:00 termina às 19:00 (ainda não terminou)
        // Mas 17:00 termina às 18:00 (já terminou), então remove
        return slotEndMinutes > currentTimeMinutes;
      });

      // Filtra também os premium slots
      premiumSlots = premiumSlots.filter((timeSlot) => {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const slotTimeMinutes = hours * 60 + minutes;
        const slotEndMinutes = slotTimeMinutes + 60;
        return slotEndMinutes > currentTimeMinutes;
      });
    }

    const bookedSlots = bookings.map((b) => ({
      timeSlot: b.startTime,
      booking: {
        id: b.id,
        userId: b.userId,
        userName: b.user.name,
        userEmail: b.user.email,
        status: b.status,
        notes: b.notes,
      },
    }));

    return {
      court: {
        id: court.id,
        name: court.name,
        defaultPrice: court.defaultPrice,
        premiumPrice: court.premiumPrice,
      },
      date,
      availableSlots,
      bookedSlots,
      premiumSlots,
    };
  }

  async findOne(id: string, organizationId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        court: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    return booking;
  }

  async update(id: string, organizationId: string, data: UpdateBookingDto) {
    await this.findOne(id, organizationId); // Verifica se existe e pertence à organização

    // Constrói o objeto de atualização apenas com campos permitidos
    const updateData: any = {};
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        court: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId); // Verifica se existe e pertence à organização
    return this.prisma.booking.delete({ where: { id } });
  }
}



