import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourtAvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(courtId: string, specificDate?: string) {
    // Verifica se a quadra existe
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }

    const result: {
      weekly: Record<number, string[]>;
      specificDates: Record<string, string[]>;
      premium: Record<number, string[]>;
      premiumSpecificDates: Record<string, string[]>;
    } = {
      weekly: {},
      specificDates: {},
      premium: {},
      premiumSpecificDates: {},
    };

    if (specificDate) {
      // Busca disponibilidade de uma data específica
      // Parse da data no formato YYYY-MM-DD sem problemas de timezone
      const [year, month, day] = specificDate.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const nextDay = new Date(date);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      const dayOfWeek = date.getUTCDay(); // Dia da semana (0 = Domingo, 6 = Sábado)

      // Busca primeiro se há disponibilidade específica para a data
      const specificAvail = await this.prisma.courtAvailability.findMany({
        where: {
          courtId,
          specificDate: { gte: date, lt: nextDay },
        },
        orderBy: [{ timeSlot: 'asc' }],
      });

      if (specificAvail.length > 0) {
        // Se houver disponibilidade específica, retorna apenas ela
        // Usa a data original (YYYY-MM-DD) para garantir consistência
        result.specificDates[specificDate] = specificAvail.map((item) => item.timeSlot);
        result.premiumSpecificDates[specificDate] = specificAvail
          .filter((item) => item.isPremium)
          .map((item) => item.timeSlot);
        return result; // Retorna apenas a disponibilidade específica
      }

      // Se não houver disponibilidade específica, busca a recorrente do dia da semana
      const weeklyAvail = await this.prisma.courtAvailability.findMany({
        where: {
          courtId,
          dayOfWeek,
          specificDate: null,
        },
        orderBy: [{ timeSlot: 'asc' }],
      });

      weeklyAvail.forEach((item) => {
        if (!result.weekly[dayOfWeek]) {
          result.weekly[dayOfWeek] = [];
        }
        result.weekly[dayOfWeek].push(item.timeSlot);
        
        // Adiciona aos horários nobres se for premium
        if (item.isPremium) {
          if (!result.premium[dayOfWeek]) {
            result.premium[dayOfWeek] = [];
          }
          result.premium[dayOfWeek].push(item.timeSlot);
        }
      });

      return result;
    } else {
      // Busca apenas disponibilidade recorrente (sem data específica)
      const weeklyAvail = await this.prisma.courtAvailability.findMany({
        where: {
          courtId,
          specificDate: null,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: 'asc' }],
      });

      weeklyAvail.forEach((item) => {
        if (item.dayOfWeek !== null) {
          if (!result.weekly[item.dayOfWeek]) {
            result.weekly[item.dayOfWeek] = [];
          }
          result.weekly[item.dayOfWeek].push(item.timeSlot);
          
          // Adiciona aos horários nobres se for premium
          if (item.isPremium) {
            if (!result.premium[item.dayOfWeek]) {
              result.premium[item.dayOfWeek] = [];
            }
            result.premium[item.dayOfWeek].push(item.timeSlot);
          }
        }
      });

      return result;
    }
  }

  async setAvailability(
    courtId: string,
    availability: { dayOfWeek: number; timeSlots: string[]; isPremium?: boolean }[],
    specificDate?: string,
  ) {
    // Verifica se a quadra existe
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }

    // Parse da data no formato YYYY-MM-DD sem problemas de timezone
    let date: Date | null = null;
    if (specificDate) {
      const [year, month, day] = specificDate.split('-').map(Number);
      date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }

    // Remove disponibilidade existente (recorrente ou da data específica)
    if (date) {
      // Remove disponibilidade da data específica
      const nextDay = new Date(date);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      await this.prisma.courtAvailability.deleteMany({
        where: {
          courtId,
          specificDate: {
            gte: date,
            lt: nextDay,
          },
        },
      });
    } else {
      // Remove apenas disponibilidade recorrente (sem data específica)
      await this.prisma.courtAvailability.deleteMany({
        where: {
          courtId,
          specificDate: null,
        },
      });
    }

    // Cria nova disponibilidade
    // Agrupa por isPremium para processar corretamente
    const data = availability.flatMap((day) =>
      day.timeSlots
        .filter((timeSlot) => timeSlot && timeSlot.trim() !== '') // Filtra slots vazios
        .map((timeSlot) => ({
          courtId,
          dayOfWeek: date ? null : day.dayOfWeek,
          specificDate: date || null,
          timeSlot: timeSlot.trim(),
          isPremium: day.isPremium ?? false, // Usa o isPremium do objeto do dia
        })),
    );

    if (data.length > 0) {
      try {
        await this.prisma.courtAvailability.createMany({
          data,
          skipDuplicates: true, // Ignora duplicatas
        });
      } catch (error: any) {
        console.error('Erro ao criar disponibilidade:', error);
        // Se for erro de campo não encontrado, provavelmente a migration não foi aplicada
        if (error.code === 'P2003' || error.message?.includes('Unknown column')) {
          throw new InternalServerErrorException(
            'Campo specificDate não encontrado. Execute a migration: npm run prisma:migrate',
          );
        }
        throw new InternalServerErrorException(
          `Erro ao salvar disponibilidade: ${error.message || 'Erro desconhecido'}`,
        );
      }
    }

    return this.getAvailability(courtId, specificDate);
  }

  async replicateWeekdayWeekend(
    courtId: string,
    weekdaySlots: string[],
    weekendSlots: string[],
    weekdayPremiumSlots: string[] = [],
    weekendPremiumSlots: string[] = [],
  ) {
    // Segunda a Sexta (1-5)
    const weekdayDays = [1, 2, 3, 4, 5];
    // Sábado e Domingo (6, 0)
    const weekendDays = [6, 0];

    // Separa horários normais e nobres para dias de semana
    const weekdayNormalSlots = weekdaySlots.filter((slot) => !weekdayPremiumSlots.includes(slot));
    const weekendNormalSlots = weekendSlots.filter((slot) => !weekendPremiumSlots.includes(slot));

    const availability = [
      // Horários normais de dias de semana
      ...weekdayDays.map((day) => ({
        dayOfWeek: day,
        timeSlots: weekdayNormalSlots,
        isPremium: false,
      })),
      // Horários nobres de dias de semana
      ...weekdayDays.map((day) => ({
        dayOfWeek: day,
        timeSlots: weekdayPremiumSlots,
        isPremium: true,
      })),
      // Horários normais de finais de semana
      ...weekendDays.map((day) => ({
        dayOfWeek: day,
        timeSlots: weekendNormalSlots,
        isPremium: false,
      })),
      // Horários nobres de finais de semana
      ...weekendDays.map((day) => ({
        dayOfWeek: day,
        timeSlots: weekendPremiumSlots,
        isPremium: true,
      })),
    ].filter((item) => item.timeSlots.length > 0); // Remove itens vazios

    return this.setAvailability(courtId, availability);
  }

  async addTimeSlot(courtId: string, dayOfWeek: number, timeSlot: string) {
    // Verifica se a quadra existe
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }

    // Verifica se já existe
    const existing = await this.prisma.courtAvailability.findUnique({
      where: {
        courtId_dayOfWeek_timeSlot: {
          courtId,
          dayOfWeek,
          timeSlot,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.courtAvailability.create({
      data: {
        courtId,
        dayOfWeek,
        timeSlot,
      },
    });
  }

  async removeTimeSlot(courtId: string, dayOfWeek: number, timeSlot: string) {
    await this.prisma.courtAvailability.deleteMany({
      where: {
        courtId,
        dayOfWeek,
        timeSlot,
      },
    });
  }

  async isTimeSlotAvailable(
    courtId: string,
    date: Date,
    timeSlot: string,
  ): Promise<boolean> {
    // Usa UTC para manter consistência com o resto do código
    // A data já vem como UTC do BookingsService
    const dayOfWeek = date.getUTCDay(); // Dia da semana em UTC (0 = Domingo, 6 = Sábado)
    
    // Cria dateOnly usando UTC para comparação
    const dateOnly = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0, 0, 0, 0
    ));
    const nextDay = new Date(dateOnly);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Verifica primeiro se há disponibilidade específica para essa data
    const specificAvailability = await this.prisma.courtAvailability.findFirst({
      where: {
        courtId,
        specificDate: { gte: dateOnly, lt: nextDay },
        timeSlot,
      },
    });

    if (specificAvailability) {
      return true;
    }

    // Se não houver disponibilidade específica, verifica a recorrente
    const weeklyAvailability = await this.prisma.courtAvailability.findFirst({
      where: {
        courtId,
        dayOfWeek,
        specificDate: null,
        timeSlot,
      },
    });

    return !!weeklyAvailability;
  }

  async getSpecificDates(courtId: string): Promise<string[]> {
    // Verifica se a quadra existe
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }

    // Busca todas as datas específicas configuradas (apenas futuras ou atual)
    // Usa UTC para manter consistência
    const now = new Date();
    const today = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    const specificDates = await this.prisma.courtAvailability.findMany({
      where: {
        courtId,
        specificDate: { gte: today },
      },
      select: {
        specificDate: true,
      },
      distinct: ['specificDate'],
      orderBy: {
        specificDate: 'asc',
      },
    });

    // Retorna apenas as datas únicas (formato YYYY-MM-DD)
    const uniqueDates = Array.from(
      new Set(
        specificDates
          .map((item) => item.specificDate)
          .filter((date): date is Date => date !== null)
          .map((date) => date.toISOString().split('T')[0]),
      ),
    );

    return uniqueDates;
  }

  async copyAvailabilityFrom(sourceCourtId: string, targetCourtId: string) {
    // Verifica se ambas as quadras existem
    const sourceCourt = await this.prisma.court.findUnique({ where: { id: sourceCourtId } });
    if (!sourceCourt) {
      throw new NotFoundException('Quadra de origem não encontrada');
    }

    const targetCourt = await this.prisma.court.findUnique({ where: { id: targetCourtId } });
    if (!targetCourt) {
      throw new NotFoundException('Quadra de destino não encontrada');
    }

    // Busca todas as disponibilidades da quadra de origem
    const sourceAvailability = await this.prisma.courtAvailability.findMany({
      where: { courtId: sourceCourtId },
    });

    if (sourceAvailability.length === 0) {
      return {
        message: 'A quadra de origem não possui configurações de disponibilidade',
        copied: 0,
      };
    }

    // Remove todas as disponibilidades existentes da quadra de destino
    await this.prisma.courtAvailability.deleteMany({
      where: { courtId: targetCourtId },
    });

    // Copia todas as disponibilidades para a quadra de destino
    const dataToCopy = sourceAvailability.map((item) => ({
      courtId: targetCourtId,
      dayOfWeek: item.dayOfWeek,
      specificDate: item.specificDate,
      timeSlot: item.timeSlot,
      isPremium: item.isPremium,
    }));

    await this.prisma.courtAvailability.createMany({
      data: dataToCopy,
      skipDuplicates: true,
    });

    return {
      message: `Configurações copiadas com sucesso! ${dataToCopy.length} configurações copiadas.`,
      copied: dataToCopy.length,
    };
  }

  async setPremiumTimeSlots(
    courtId: string,
    timeSlots: { dayOfWeek?: number; specificDate?: string; timeSlot: string }[],
    isPremium: boolean,
  ) {
    // Verifica se a quadra existe
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Quadra não encontrada');
    }

    // Atualiza cada horário
    const updates = await Promise.all(
      timeSlots.map(async (slot) => {
        const where: any = {
          courtId,
          timeSlot: slot.timeSlot,
        };

        if (slot.specificDate) {
          // Para data específica
          const [year, month, day] = slot.specificDate.split('-').map(Number);
          const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
          const nextDay = new Date(date);
          nextDay.setUTCDate(nextDay.getUTCDate() + 1);
          where.specificDate = { gte: date, lt: nextDay };
        } else if (slot.dayOfWeek !== undefined) {
          // Para dia da semana
          where.dayOfWeek = slot.dayOfWeek;
          where.specificDate = null;
        }

        return this.prisma.courtAvailability.updateMany({
          where,
          data: { isPremium },
        });
      }),
    );

    return {
      message: `${updates.length} horário(s) atualizado(s) como ${isPremium ? 'nobre' : 'normal'}.`,
      updated: updates.length,
    };
  }
}

