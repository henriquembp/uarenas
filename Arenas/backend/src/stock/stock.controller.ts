import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('movements')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getMovements(@Query('productId') productId?: string) {
    return this.stockService.getMovements(productId);
  }

  @Get(':productId')
  getStock(@Param('productId') productId: string) {
    return this.stockService.getStock(productId);
  }

  @Post('movements')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  createMovement(@Body() createDto: any) {
    return this.stockService.createMovement(createDto);
  }
}



