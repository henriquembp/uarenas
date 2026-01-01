import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourtDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['esportes_areia'])
  sportType: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  defaultPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  premiumPrice?: number;
}

