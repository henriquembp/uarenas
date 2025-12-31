import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.store.create({ data });
  }

  async findAll() {
    return this.prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.store.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.store.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.store.update({
      where: { id },
      data: { isActive: false },
    });
  }
}



