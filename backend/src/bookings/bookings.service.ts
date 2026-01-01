import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourtAvailabilityService } from '../courts/court-availability.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private availabilityService: CourtAvailabilityService,
  ) {}

  async create(data: any) {
    // Valida se o horário está disponível
    const date = new Date(data.date);

    const isAvailable = await this.availabilityService.isTimeSlotAvailable(
      data.courtId,
      date,
      data.startTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('Este horário não está disponível para reserva nesta quadra');
    }

    // Verifica se já existe uma reserva no mesmo horário
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        courtId: data.courtId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
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
        ...data,
        endTime,
      },
    });
  }

  async findAll(filters?: any) {
    return this.prisma.booking.findMany({
      where: filters,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        court: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        court: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.booking.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.booking.delete({ where: { id } });
  }
}



