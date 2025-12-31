import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CourtsModule } from './courts/courts.module';
import { BookingsModule } from './bookings/bookings.module';
import { ClassesModule } from './classes/classes.module';
import { InvoicesModule } from './invoices/invoices.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CourtsModule,
    BookingsModule,
    ClassesModule,
    InvoicesModule,
    StoresModule,
    ProductsModule,
    StockModule,
    SalesModule,
  ],
})
export class AppModule {}

