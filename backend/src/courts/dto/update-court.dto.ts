import { PartialType } from '@nestjs/mapped-types';
import { CreateCourtDto } from './create-court.dto';
import { IsOptional, IsString, IsBoolean, IsIn, IsNumber, Min, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

  @ValidateIf((o) => o.defaultPrice !== null && o.defaultPrice !== undefined)
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => value === '' ? null : value)
  defaultPrice?: number | null;

  @ValidateIf((o) => o.premiumPrice !== null && o.premiumPrice !== undefined)
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => value === '' ? null : value)
  premiumPrice?: number | null;
}

