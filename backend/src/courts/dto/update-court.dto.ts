import { PartialType } from '@nestjs/mapped-types';
import { CreateCourtDto } from './create-court.dto';
import { IsOptional, IsString, IsBoolean, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCourtDto extends PartialType(CreateCourtDto) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['esportes_areia'])
  sportType?: string;

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

