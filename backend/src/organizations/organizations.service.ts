import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationPlan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    subdomain: string;
    domain?: string;
    plan?: OrganizationPlan;
  }) {
    return this.prisma.organization.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        domain: data.domain,
        plan: data.plan || OrganizationPlan.FREE,
      },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    console.log('🔍 OrganizationsService.findOne - Buscando organização com ID:', id);
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });
    console.log('🔍 OrganizationsService.findOne - Organização encontrada:', organization ? 'SIM' : 'NÃO');
    if (!organization) {
      console.error('❌ OrganizationsService.findOne - Organização não encontrada com ID:', id);
      throw new NotFoundException(`Organização não encontrada com ID: ${id}`);
    }
    return organization;
  }

  async findBySubdomain(subdomain: string) {
    return this.prisma.organization.findUnique({
      where: { subdomain },
    });
  }

  async findById(id: string) {
    return this.findOne(id);
  }

  async update(id: string, data: {
    name?: string;
    subdomain?: string;
    domain?: string;
    plan?: OrganizationPlan;
    isActive?: boolean;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  }) {
    try {
      await this.findOne(id); // Verifica se existe

      // Validação de cores (formato hexadecimal - 3 ou 6 dígitos)
      const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
      if (data.primaryColor && !hexColorRegex.test(data.primaryColor)) {
        throw new BadRequestException('Cor primária deve estar no formato hexadecimal (ex: #3B82F6 ou #3BF)');
      }
      if (data.secondaryColor && !hexColorRegex.test(data.secondaryColor)) {
        throw new BadRequestException('Cor secundária deve estar no formato hexadecimal (ex: #8B5CF6 ou #8B5)');
      }
      if (data.accentColor && !hexColorRegex.test(data.accentColor)) {
        throw new BadRequestException('Cor de destaque deve estar no formato hexadecimal (ex: #F59E0B ou #F59)');
      }

      // Validação de URL da logo
      if (data.logoUrl && !this.isValidUrl(data.logoUrl)) {
        throw new BadRequestException('URL da logo inválida');
      }

      return await this.prisma.organization.update({
        where: { id },
        data,
      });
    } catch (error) {
      // Se já é uma exceção do NestJS, re-lança
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof BadRequestException) {
        throw error;
      }

      // Erros do Prisma
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'campo';
        throw new ConflictException(`${field} já está em uso`);
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Organização não encontrada');
      }

      // Erro de campo não encontrado (migration não aplicada)
      if (error.message?.includes('Unknown column') || 
          error.message?.includes('column') && error.message?.includes('does not exist')) {
        throw new InternalServerErrorException(
          'Campos de personalização não encontrados. Verifique se a migration foi aplicada: npm run prisma:migrate:deploy'
        );
      }

      // Outros erros
      console.error('Erro ao atualizar organização:', error);
      throw new InternalServerErrorException(
        `Erro ao atualizar organização: ${error.message || 'Erro desconhecido'}`
      );
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica se existe
    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async createWithAdmin(data: {
    name: string;
    subdomain: string;
    domain?: string;
    plan?: OrganizationPlan;
    adminEmail: string;
    adminPassword: string;
    adminName: string;
    adminPhone?: string;
  }) {
    // Verifica se subdomain já existe
    const existingOrg = await this.findBySubdomain(data.subdomain);
    if (existingOrg) {
      throw new ConflictException('Subdomain já está em uso');
    }

    // Verifica se email já existe (em qualquer organização)
    const existingUser = await this.prisma.user.findFirst({
      where: { email: data.adminEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Cria organização e usuário ADMIN em uma transação
    return this.prisma.$transaction(async (tx) => {
      // 1. Criar organização
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          subdomain: data.subdomain,
          domain: data.domain,
          plan: data.plan || OrganizationPlan.FREE,
        },
      });

      // 2. Criar usuário ADMIN
      const hashedPassword = await bcrypt.hash(data.adminPassword, 10);
      const admin = await tx.user.create({
        data: {
          email: data.adminEmail,
          password: hashedPassword,
          name: data.adminName,
          phone: data.adminPhone,
          organizationId: organization.id,
          role: 'ADMIN',
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        organization,
        admin,
      };
    });
  }
}
