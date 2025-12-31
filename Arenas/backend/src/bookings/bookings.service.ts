import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.booking.create({ data });
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



