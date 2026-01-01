import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CourtAvailabilityService } from './court-availability.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Controller('courts')
export class CourtsController {
  constructor(
    private readonly courtsService: CourtsService,
    private readonly availabilityService: CourtAvailabilityService,
  ) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.courtsService.findAll(includeInactive === 'true');
  }

  @Get(':id/availability')
  getAvailability(@Param('id') id: string, @Query('date') date?: string) {
    return this.availabilityService.getAvailability(id, date);
  }

  @Get(':id/availability/specific-dates')
  getSpecificDates(@Param('id') id: string) {
    return this.availabilityService.getSpecificDates(id);
  }

  @Post(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  setAvailability(
    @Param('id') id: string,
    @Body() body: {
      availability: { dayOfWeek: number; timeSlots: string[]; isPremium?: boolean }[];
      specificDate?: string;
    },
  ) {
    return this.availabilityService.setAvailability(
      id,
      body.availability,
      body.specificDate,
    );
  }

  @Post(':id/availability/premium')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  setPremiumTimeSlots(
    @Param('id') id: string,
    @Body() body: {
      timeSlots: { dayOfWeek?: number; specificDate?: string; timeSlot: string }[];
      isPremium: boolean;
    },
  ) {
    return this.availabilityService.setPremiumTimeSlots(
      id,
      body.timeSlots,
      body.isPremium,
    );
  }

  @Post(':id/availability/replicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  replicateAvailability(
    @Param('id') id: string,
    @Body() body: {
      weekdaySlots: string[];
      weekendSlots: string[];
      weekdayPremiumSlots?: string[];
      weekendPremiumSlots?: string[];
    },
  ) {
    return this.availabilityService.replicateWeekdayWeekend(
      id,
      body.weekdaySlots,
      body.weekendSlots,
      body.weekdayPremiumSlots || [],
      body.weekendPremiumSlots || [],
    );
  }

  @Post(':id/availability/copy-from/:sourceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  copyAvailability(
    @Param('id') id: string,
    @Param('sourceId') sourceId: string,
  ) {
    return this.availabilityService.copyAvailabilityFrom(sourceId, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createDto: CreateCourtDto) {
    return this.courtsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateDto: UpdateCourtDto) {
    return this.courtsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.courtsService.remove(id);
  }
}



