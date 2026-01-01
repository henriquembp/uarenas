import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn, IsNumber, Min, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

