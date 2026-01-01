import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async createMovement(data: any) {
    return this.prisma.stockMovement.create({ data });
  }

  async getMovements(productId?: string) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStock(productId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { productId },
    });

    const stock = movements.reduce((acc, movement) => {
      if (movement.type === 'ENTRY') {
        return acc + movement.quantity;
      } else if (movement.type === 'EXIT') {
        return acc - movement.quantity;
      } else if (movement.type === 'ADJUSTMENT') {
        return movement.quantity; // Ajuste substitui o valor
      }
      return acc;
    }, 0);

    return { productId, stock };
  }
}



