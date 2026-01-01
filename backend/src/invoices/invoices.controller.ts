import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  create(@Body() createDto: any) {
    return this.invoicesService.create(createDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.invoicesService.update(id, updateDto);
  }

  @Patch(':id/pay')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  markAsPaid(@Param('id') id: string) {
    return this.invoicesService.markAsPaid(id);
  }
}



