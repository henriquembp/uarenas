import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
    organizationId: string,
    phone?: string,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      phone,
      organizationId,
      role: 'VISITOR',
    });
    const { password: _, ...result } = user;
    return result;
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



