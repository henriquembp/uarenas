import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCourtDto) {
    return this.prisma.court.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        sportType: createDto.sportType,
        isActive: createDto.isActive ?? true,
        imageUrl: createDto.imageUrl,
        defaultPrice: createDto.defaultPrice !== null && createDto.defaultPrice !== undefined
          ? new Prisma.Decimal(createDto.defaultPrice)
          : null,
        premiumPrice: createDto.premiumPrice !== null && createDto.premiumPrice !== undefined
          ? new Prisma.Decimal(createDto.premiumPrice)
          : null,
      },
    });
  }

  async findAll(includeInactive = false) {
    return this.prisma.court.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }
    return court;
  }

  async update(id: string, updateDto: UpdateCourtDto) {
    await this.findOne(id); // Verifica se existe
    
    const updateData: any = { ...updateDto };
    
    // Converte valores de preço para Decimal se fornecidos
    if (updateDto.defaultPrice !== undefined) {
      updateData.defaultPrice = updateDto.defaultPrice !== null 
        ? new Prisma.Decimal(updateDto.defaultPrice) 
        : null;
    }
    
    if (updateDto.premiumPrice !== undefined) {
      updateData.premiumPrice = updateDto.premiumPrice !== null 
        ? new Prisma.Decimal(updateDto.premiumPrice) 
        : null;
    }
    
    return this.prisma.court.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe
    return this.prisma.court.update({
      where: { id },
      data: { isActive: false },
    });
  }
}



