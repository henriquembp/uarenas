import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.path;
    
    // Rotas públicas que não precisam de organizationId
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/health',
      '/organizations/register',
    ];
    
    // Se for uma rota pública, não precisa de organizationId
    if (publicRoutes.some(route => path.startsWith(route))) {
      return next.handle();
    }
    
    // Tenta obter organizationId de várias fontes:
    // 1. Header X-Organization-Id
    // 2. Subdomain do host
    // 3. JWT token (já extraído pelo JwtStrategy)
    
    let organizationId = request.headers['x-organization-id'];
    
    if (!organizationId) {
      // Tenta obter do subdomain
      const host = request.headers.host;
      if (host) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          const organization = await this.prisma.organization.findUnique({
            where: { subdomain },
          });
          if (organization) {
            organizationId = organization.id;
          }
        }
      }
    }
    
    // Se não encontrou, tenta do user no JWT (pode não existir ainda se o guard não executou)
    if (!organizationId && request.user?.organizationId) {
      organizationId = request.user.organizationId;
    }
    
    // Se ainda não encontrou organizationId, NÃO lança erro aqui
    // Deixa os guards e controllers tratarem isso
    // O interceptor apenas adiciona organizationId se encontrar
    if (organizationId) {
      request.organizationId = organizationId;
    }
    
    return next.handle();
  }
}
