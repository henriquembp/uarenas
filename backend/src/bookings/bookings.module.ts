import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CourtsModule } from '../courts/courts.module';

@Module({
  imports: [PrismaModule, CourtsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}



