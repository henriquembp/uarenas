import { IsString, IsNotEmpty, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  courtId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // Formato: YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  startTime: string; // Formato: HH:mm

  @IsString()
  @IsOptional()
  notes?: string;
}
