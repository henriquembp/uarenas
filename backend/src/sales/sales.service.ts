import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: string; items: any[]; notes?: string }) {
    const total = data.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    return this.prisma.sale.create({
      data: {
        userId: data.userId,
        total,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: Number(item.unitPrice) * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAll(filters?: any) {
    return this.prisma.sale.findMany({
      where: filters,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}



