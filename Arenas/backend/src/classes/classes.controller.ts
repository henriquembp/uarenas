import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  create(@Body() createDto: any) {
    return this.classesService.create(createDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.classesService.update(id, updateDto);
  }

  @Post(':id/students')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  addStudent(@Param('id') id: string, @Body() body: { studentId: string }) {
    return this.classesService.addStudent(id, body.studentId);
  }

  @Delete(':id/students/:studentId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.classesService.removeStudent(id, studentId);
  }
}



