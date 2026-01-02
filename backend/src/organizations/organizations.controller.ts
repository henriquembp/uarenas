import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationPlan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly prisma: PrismaService,
  ) {}

  // Endpoint público para registro de novas organizações (SaaS)
  @Post('register')
  register(@Body() createDto: {
    name: string;
    subdomain: string;
    domain?: string;
    plan?: OrganizationPlan;
    // Dados do primeiro usuário ADMIN
    adminEmail: string;
    adminPassword: string;
    adminName: string;
    adminPhone?: string;
  }) {
    return this.organizationsService.createWithAdmin(createDto);
  }

  // Endpoint protegido para criar organizações (requer ADMIN)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createDto: {
    name: string;
    subdomain: string;
    domain?: string;
    plan?: OrganizationPlan;
  }) {
    return this.organizationsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  // Endpoint público para buscar dados da organização atual (usado no frontend)
  // IMPORTANTE: Deve vir ANTES de @Get(':id') para não ser interpretado como parâmetro
  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrent(@Request() req: any) {
    console.log('🔍 getCurrent - req.user:', req.user);
    
    let organizationId = req.user?.organizationId;
    const userId = req.user?.userId || req.user?.sub;
    
    console.log('🔍 organizationId do token:', organizationId);
    console.log('🔍 userId:', userId);
    
    // Se não tiver no token, busca do usuário no banco
    if (!organizationId && userId) {
      console.log('🔍 Buscando organizationId do banco para userId:', userId);
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true, email: true },
      });
      console.log('🔍 Usuário encontrado no banco:', user);
      if (user?.organizationId) {
        organizationId = user.organizationId;
        console.log('✅ organizationId encontrado no banco:', organizationId);
      } else {
        console.error('❌ Usuário não tem organizationId no banco:', user);
      }
    }
    
    if (!organizationId) {
      console.error('❌ Organization ID não encontrado. req.user:', req.user);
      throw new BadRequestException(
        `Organization ID não encontrado. UserId: ${userId || 'não encontrado'}. Faça login novamente ou verifique se o usuário tem organizationId no banco de dados.`
      );
    }
    
    console.log('✅ Buscando organização com ID:', organizationId);
    try {
      return await this.organizationsService.findById(organizationId);
    } catch (error) {
      console.error('❌ Erro ao buscar organização:', error);
      throw error;
    }
  }

  @Get('subdomain/:subdomain')
  findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.organizationsService.findBySubdomain(subdomain);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateDto: {
      name?: string;
      subdomain?: string;
      domain?: string;
      plan?: OrganizationPlan;
      isActive?: boolean;
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
    },
  ) {
    try {
      return await this.organizationsService.update(id, updateDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
