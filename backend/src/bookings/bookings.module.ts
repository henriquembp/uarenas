import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CourtsModule } from '../courts/courts.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [PrismaModule, CourtsModule, InvoicesModule, MessagingModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}



