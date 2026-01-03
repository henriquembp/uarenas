import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Tenant } from '../tenant/tenant.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Tenant() organizationId: string, @Query() query: any) {
    return this.invoicesService.findAll(organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Tenant() organizationId: string) {
    return this.invoicesService.findOne(id, organizationId);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  create(@Body() createDto: CreateInvoiceDto, @Tenant() organizationId: string) {
    return this.invoicesService.create(createDto, organizationId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateInvoiceDto, @Tenant() organizationId: string) {
    return this.invoicesService.update(id, organizationId, updateDto);
  }

  @Patch(':id/pay')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  markAsPaid(@Param('id') id: string, @Tenant() organizationId: string) {
    return this.invoicesService.markAsPaid(id, organizationId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string, @Tenant() organizationId: string) {
    return this.invoicesService.remove(id, organizationId);
  }
}



