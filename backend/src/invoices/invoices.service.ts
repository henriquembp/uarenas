import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.invoice.create({ data });
  }

  async findAll(filters?: any) {
    return this.prisma.invoice.findMany({
      where: filters,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        class: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        class: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.invoice.update({ where: { id }, data });
  }

  async markAsPaid(id: string) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'PAID', paidDate: new Date() },
    });
  }
}



