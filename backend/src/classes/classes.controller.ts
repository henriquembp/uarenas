import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Tenant } from '../tenant/tenant.decorator';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll(@Tenant() organizationId: string, @Query() query: any) {
    return this.classesService.findAll(organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Tenant() organizationId: string) {
    return this.classesService.findOne(id, organizationId);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  create(@Body() createDto: CreateClassDto, @Tenant() organizationId: string) {
    return this.classesService.create(createDto, organizationId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateClassDto, @Tenant() organizationId: string) {
    return this.classesService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string, @Tenant() organizationId: string) {
    return this.classesService.delete(id, organizationId);
  }

  @Post(':id/students')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  addStudent(
    @Param('id') id: string,
    @Body() body: { studentId: string; monthlyPrice: number },
    @Tenant() organizationId: string,
  ) {
    return this.classesService.addStudent(id, body.studentId, organizationId, body.monthlyPrice || 0);
  }

  @Delete(':id/students/:studentId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string, @Tenant() organizationId: string) {
    return this.classesService.removeStudent(id, studentId, organizationId);
  }
}



