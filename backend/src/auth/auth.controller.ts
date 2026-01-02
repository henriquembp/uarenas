import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    // O sistema identifica automaticamente a organização pelo email do usuário
    // Não é necessário passar organizationId ou subdomain
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(
    @Body() registerDto: { 
      email: string; 
      password: string; 
      name: string; 
      organizationId: string;
      phone?: string;
    },
  ) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
      registerDto.organizationId,
      registerDto.phone,
    );
  }
}



