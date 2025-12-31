import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Habilitar CORS
    const frontendUrl = process.env.FRONTEND_URL;
    const allowedOrigins = frontendUrl
      ? frontendUrl.split(',').map((url) => url.trim())
      : ['http://localhost:3000'];

    app.enableCors({
      origin: (origin, callback) => {
        // Permite requisições sem origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    });

    // Validação global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend rodando na porta ${port}`);
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();



