import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInvoiceDto, organizationId: string) {
    // Valida se o usuário pertence à organização
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId, organizationId },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Valida booking se fornecido
    if (data.bookingId) {
      const booking = await this.prisma.booking.findFirst({
        where: { id: data.bookingId, organizationId },
      });
      if (!booking) {
        throw new NotFoundException('Reserva não encontrada');
      }
    }

    // Parse da data de vencimento
    const dueDate = new Date(data.dueDate);

    return this.prisma.invoice.create({
      data: {
        organizationId,
        userId: data.userId,
        bookingId: data.bookingId || null,
        classId: data.classId || null,
        description: data.description,
        amount: new Prisma.Decimal(data.amount),
        dueDate,
        status: data.status || 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        booking: {
          include: {
            court: { select: { id: true, name: true } },
          },
        },
        class: true,
      },
    });
  }

  async createFromBooking(
    bookingId: string,
    organizationId: string,
    userId: string,
    amount: number,
    description: string,
    dueDate: Date,
  ) {
    return this.prisma.invoice.create({
      data: {
        organizationId,
        userId,
        bookingId,
        description,
        amount: new Prisma.Decimal(amount),
        dueDate,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        booking: {
          include: {
            court: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async findAll(organizationId: string, filters?: any) {
    return this.prisma.invoice.findMany({
      where: {
        organizationId,
        ...filters,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        booking: {
          include: {
            court: { select: { id: true, name: true } },
          },
        },
        class: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        booking: {
          include: {
            court: { select: { id: true, name: true } },
          },
        },
        class: true,
      },
    });
    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }
    return invoice;
  }

  async update(id: string, organizationId: string, data: UpdateInvoiceDto) {
    await this.findOne(id, organizationId); // Valida se existe e pertence à organização

    const updateData: any = {};
    if (data.description) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.status) updateData.status = data.status;
    if (data.paidDate) {
      updateData.paidDate = new Date(data.paidDate);
      if (data.status !== 'CANCELLED') {
        updateData.status = 'PAID';
      }
    } else if (data.status === 'PAID' && !data.paidDate) {
      updateData.paidDate = new Date();
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        booking: {
          include: {
            court: { select: { id: true, name: true } },
          },
        },
        class: true,
      },
    });
  }

  async markAsPaid(id: string, organizationId: string) {
    await this.findOne(id, organizationId); // Valida se existe e pertence à organização
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'PAID', paidDate: new Date() },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        booking: {
          include: {
            court: { select: { id: true, name: true } },
          },
        },
        class: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId); // Valida se existe e pertence à organização
    return this.prisma.invoice.delete({ where: { id } });
  }
}



