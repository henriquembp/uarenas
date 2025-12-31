import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.class.create({
      data,
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        court: true,
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.class.findMany({
      where: { isActive: true },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        court: true,
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        court: true,
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.class.update({
      where: { id },
      data,
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        court: true,
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async addStudent(classId: string, studentId: string) {
    return this.prisma.classStudent.create({
      data: { classId, studentId },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async removeStudent(classId: string, studentId: string) {
    return this.prisma.classStudent.updateMany({
      where: { classId, studentId },
      data: { leftAt: new Date() },
    });
  }
}



