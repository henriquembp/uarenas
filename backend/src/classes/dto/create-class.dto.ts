import { IsString, IsNotEmpty, IsInt, IsDateString, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  courtId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  @IsString()
  @IsNotEmpty()
  startTime: string; // Formato HH:mm

  @IsString()
  @IsNotEmpty()
  endTime: string; // Formato HH:mm

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // Formato: YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  endDate?: string; // Formato: YYYY-MM-DD

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
