import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
  ) {}

  async create(data: CreateClassDto, organizationId: string) {
    // Valida se a quadra existe e pertence à organização
    const court = await this.prisma.court.findFirst({
      where: { id: data.courtId, organizationId, isActive: true },
    });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada ou inativa');
    }

    // Valida se o professor existe e pertence à organização
    const teacher = await this.prisma.user.findFirst({
      where: { id: data.teacherId, organizationId },
    });
    if (!teacher) {
      throw new NotFoundException('Professor não encontrado');
    }

    // Parse das datas
    const [startYear, startMonth, startDay] = data.startDate.split('-').map(Number);
    const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));
    
    let endDate: Date | null = null;
    if (data.endDate) {
      const [endYear, endMonth, endDay] = data.endDate.split('-').map(Number);
      endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999));
    }

    // Cria a turma
    const classEntity = await this.prisma.class.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        courtId: data.courtId,
        teacherId: data.teacherId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        startDate,
        endDate,
        isActive: data.isActive ?? true,
      },
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

    // Cria reservas recorrentes para a turma (não gera invoice)
    await this.createRecurringBookings(classEntity.id, organizationId, data, startDate, endDate);

    return classEntity;
  }

  private async createRecurringBookings(
    classId: string,
    organizationId: string,
    classData: CreateClassDto,
    startDate: Date,
    endDate: Date | null,
  ) {
    // Busca informações da turma
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { teacher: true, court: true },
    });
    if (!classEntity) return;

    // Calcula todas as datas entre startDate e endDate (ou até 1 ano se não houver endDate)
    const bookings: Array<{ date: Date; startTime: string; endTime: string }> = [];
    const currentDate = new Date(startDate);
    const maxDate = endDate || new Date(Date.UTC(currentDate.getUTCFullYear() + 1, currentDate.getUTCMonth(), currentDate.getUTCDate()));

    while (currentDate <= maxDate) {
      const dayOfWeek = currentDate.getUTCDay();
      
      // Se o dia da semana corresponde ao dayOfWeek da turma
      if (dayOfWeek === classData.dayOfWeek) {
        bookings.push({
          date: new Date(currentDate),
          startTime: classData.startTime,
          endTime: classData.endTime,
        });
      }
      
      // Avança para o próximo dia
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Cria as reservas (sem gerar invoice, pois é para turma)
    for (const booking of bookings) {
      try {
        // Verifica se já existe uma reserva neste horário
        const [year, month, day] = booking.date.toISOString().split('T')[0].split('-').map(Number);
        const bookingDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const dateStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const dateEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        const existingBooking = await this.prisma.booking.findFirst({
          where: {
            organizationId,
            courtId: classData.courtId,
            date: { gte: dateStart, lte: dateEnd },
            startTime: booking.startTime,
            status: { not: 'CANCELLED' },
          },
        });

        if (!existingBooking) {
          await this.prisma.booking.create({
            data: {
              organizationId,
              userId: classEntity.teacherId, // Reserva no nome do professor
              courtId: classData.courtId,
              date: bookingDate,
              startTime: booking.startTime,
              endTime: booking.endTime,
              status: 'CONFIRMED',
              notes: `Turma: ${classEntity.name}`,
            },
          });
        }
      } catch (error) {
        console.error(`Erro ao criar reserva recorrente para turma ${classId}:`, error);
      }
    }
  }

  async findAll(organizationId: string, filters?: any) {
    return this.prisma.class.findMany({
      where: {
        organizationId,
        isActive: filters?.isActive !== false,
        ...filters,
      },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        court: true,
        students: {
          where: { leftAt: null }, // Apenas alunos ativos
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const classEntity = await this.prisma.class.findFirst({
      where: { id, organizationId },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        court: true,
        students: {
          where: { leftAt: null }, // Apenas alunos ativos
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }
    return classEntity;
  }

  async update(id: string, organizationId: string, data: UpdateClassDto) {
    await this.findOne(id, organizationId); // Valida se existe e pertence à organização

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.courtId) updateData.courtId = data.courtId;
    if (data.teacherId) updateData.teacherId = data.teacherId;
    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.startDate) {
      const [year, month, day] = data.startDate.split('-').map(Number);
      updateData.startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }
    if (data.endDate !== undefined) {
      if (data.endDate) {
        const [year, month, day] = data.endDate.split('-').map(Number);
        updateData.endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      } else {
        updateData.endDate = null;
      }
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        court: true,
        students: {
          where: { leftAt: null },
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async addStudent(classId: string, studentId: string, organizationId: string, monthlyPrice: number) {
    // Valida se a turma existe e pertence à organização
    const classEntity = await this.prisma.class.findFirst({
      where: { id: classId, organizationId },
      include: { court: true, teacher: true },
    });
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Valida se o aluno existe e pertence à organização
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, organizationId },
    });
    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    // Verifica se o aluno já está na turma
    const existingEnrollment = await this.prisma.classStudent.findFirst({
      where: { classId, studentId, leftAt: null },
    });
    if (existingEnrollment) {
      throw new BadRequestException('Aluno já está matriculado nesta turma');
    }

    // Adiciona o aluno à turma
    const enrollment = await this.prisma.classStudent.create({
      data: { classId, studentId },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Cria invoice mensal recorrente para o aluno
    if (monthlyPrice > 0) {
      await this.createMonthlyInvoiceForStudent(
        classEntity,
        student,
        monthlyPrice,
        organizationId,
      );
    }

    return enrollment;
  }

  private async createMonthlyInvoiceForStudent(
    classEntity: any,
    student: any,
    monthlyPrice: number,
    organizationId: string,
  ) {
    // Calcula a data de vencimento (primeiro dia do próximo mês)
    const now = new Date();
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    
    const description = `Mensalidade - ${classEntity.name} - ${nextMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;

    try {
      await this.invoicesService.create(
        {
          userId: student.id,
          classId: classEntity.id,
          description,
          amount: monthlyPrice,
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'PENDING',
        },
        organizationId,
      );
    } catch (error) {
      console.error('Erro ao criar invoice mensal para aluno:', error);
    }
  }

  async removeStudent(classId: string, studentId: string, organizationId: string) {
    // Valida se a turma existe e pertence à organização
    await this.findOne(classId, organizationId);

    return this.prisma.classStudent.updateMany({
      where: { classId, studentId },
      data: { leftAt: new Date() },
    });
  }

  async delete(id: string, organizationId: string) {
    await this.findOne(id, organizationId); // Valida se existe e pertence à organização
    return this.prisma.class.update({
      where: { id },
      data: { isActive: false },
    });
  }
}



