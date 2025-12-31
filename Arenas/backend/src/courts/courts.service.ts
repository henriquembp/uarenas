import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.court.create({ data });
  }

  async findAll() {
    return this.prisma.court.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.court.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.court.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.court.update({
      where: { id },
      data: { isActive: false },
    });
  }
}



