import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findAll(@Query() query: any) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  create(@Body() createDto: any) {
    return this.salesService.create(createDto);
  }
}



