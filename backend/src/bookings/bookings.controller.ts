import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Tenant } from '../tenant/tenant.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Endpoint para ver horários disponíveis por dia/quadra
  // IMPORTANTE: Deve vir ANTES de @Get(':id') para não ser interpretado como parâmetro
  @Get('availability')
  getAvailability(
    @Query('courtId') courtId: string,
    @Query('date') date: string,
    @Tenant() organizationId: string,
  ) {
    if (!courtId || !date) {
      throw new BadRequestException('courtId e date são obrigatórios');
    }
    return this.bookingsService.getAvailability(courtId, date, organizationId);
  }

  // Endpoint para ver minhas reservas
  // IMPORTANTE: Deve vir ANTES de @Get(':id') para não ser interpretado como parâmetro
  @Get('my')
  findMyBookings(@Request() req: any, @Tenant() organizationId: string) {
    const userId = req.user?.userId || req.user?.sub;
    return this.bookingsService.findMyBookings(userId, organizationId);
  }

  // Endpoint para ver todas as reservas (apenas ADMIN)
  // IMPORTANTE: Deve vir ANTES de @Get(':id') para não ser interpretado como parâmetro
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll(@Query() query: any, @Tenant() organizationId: string) {
    return this.bookingsService.findAll(organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Tenant() organizationId: string) {
    return this.bookingsService.findOne(id, organizationId);
  }

  @Post()
  create(@Body() createDto: CreateBookingDto, @Request() req: any, @Tenant() organizationId: string) {
    const userId = req.user?.userId || req.user?.sub;
    return this.bookingsService.create(createDto, userId, organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateBookingDto, @Tenant() organizationId: string) {
    return this.bookingsService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Tenant() organizationId: string) {
    return this.bookingsService.remove(id, organizationId);
  }
}



