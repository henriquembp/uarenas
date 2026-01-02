import { IsOptional, IsIn, IsString } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

  @IsOptional()
  @IsString()
  notes?: string;
}
