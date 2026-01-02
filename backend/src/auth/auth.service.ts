import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private organizationsService: OrganizationsService,
  ) {}


  async login(email: string, password: string) {
    // Busca o usuário pelo email (sem organizationId)
    // O sistema identifica automaticamente a organização do usuário
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    console.log('🔐 Login - Usuário encontrado:', {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });
    
    if (!user.organizationId) {
      console.error('❌ Login - Usuário não tem organizationId!', user);
      throw new UnauthorizedException('Usuário não está vinculado a uma organização. Entre em contato com o administrador.');
    }
    
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      organizationId: user.organizationId,
    };
    
    console.log('🔐 Login - Payload do JWT:', payload);
    
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(
    email: string, 
    password: string, 
    name: string, 
    organizationId?: string,
    subdomain?: string,
    phone?: string,
  ) {
    // Se não foi fornecido organizationId, tenta identificar pela subdomain ou usa organização padrão
    let finalOrganizationId = organizationId || undefined;
    
    console.log('🔐 Register - Parâmetros recebidos:', {
      email,
      name,
      organizationId,
      subdomain,
      phone,
    });
    
    if (!finalOrganizationId && subdomain) {
      const organization = await this.organizationsService.findBySubdomain(subdomain);
      if (organization) {
        finalOrganizationId = organization.id;
        console.log('🔐 Register - Organização encontrada por subdomain:', finalOrganizationId);
      }
    }
    
    // Se ainda não tem organizationId, usa a organização padrão
    if (!finalOrganizationId) {
      finalOrganizationId = '00000000-0000-0000-0000-000000000001';
      console.log('🔐 Register - Usando organização padrão:', finalOrganizationId);
      
      // Verifica se a organização padrão existe
      try {
        await this.organizationsService.findOne(finalOrganizationId);
        console.log('🔐 Register - Organização padrão encontrada');
      } catch (error) {
        console.error('❌ Register - Organização padrão não encontrada!', error);
        throw new Error('Organização padrão não encontrada. Entre em contato com o administrador.');
      }
    }
    
    // Garante que finalOrganizationId não seja undefined ou null
    if (!finalOrganizationId || finalOrganizationId.trim() === '') {
      throw new Error('Não foi possível determinar a organização para o cadastro');
    }
    
    console.log('🔐 Register - Criando usuário com organizationId:', finalOrganizationId);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      phone,
      organizationId: finalOrganizationId,
      role: 'VISITOR',
    });
    
    // Faz login automático após registro
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      organizationId: user.organizationId,
    };
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async validateUser(email: string, password: string) {
    // Busca o usuário pelo email (sem organizationId)
    // O email é único por organização, mas podemos buscar em todas se necessário
    // Na prática, o email deve ser único globalmente ou o sistema deve identificar pela organização
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }
}



