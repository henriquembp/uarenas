import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        organizationId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    console.log('🔍 UsersService.findOne - Buscando usuário com ID:', id);
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        organizationId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    console.log('🔍 UsersService.findOne - Usuário encontrado:', {
      id: user?.id,
      email: user?.email,
      organizationId: user?.organizationId,
    });
    return user;
  }

  async findByEmail(email: string) {
    // Busca o usuário pelo email
    // Como o email é único por organização, mas pode haver emails iguais em organizações diferentes,
    // buscamos o primeiro encontrado. Em um SaaS real, você pode querer buscar por subdomain também.
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        organizationId: true,
        email: true,
        password: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    console.log('🔍 findByEmail - Usuário encontrado:', {
      email,
      id: user?.id,
      organizationId: user?.organizationId,
    });
    
    return user;
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    organizationId: string;
    phone?: string;
    role?: UserRole;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        organizationId: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}



