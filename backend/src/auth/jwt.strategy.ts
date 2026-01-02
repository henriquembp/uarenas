import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('🔐 JwtStrategy.validate - Payload recebido:', payload);
    
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      console.error('❌ JwtStrategy - Usuário não encontrado para payload.sub:', payload.sub);
      throw new UnauthorizedException();
    }
    
    console.log('🔐 JwtStrategy.validate - Usuário encontrado no banco:', {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });
    
    // Prioriza organizationId do payload do token (mais confiável)
    // Se não tiver no payload, usa do banco
    const organizationId = payload.organizationId || user.organizationId;
    
    console.log('🔐 JwtStrategy.validate - organizationId final:', organizationId);
    
    const result = { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      organizationId: organizationId, // Usa do payload ou do banco
      sub: user.id, // Mantém compatibilidade
    };
    
    console.log('🔐 JwtStrategy.validate - Retornando:', result);
    
    return result;
  }
}



