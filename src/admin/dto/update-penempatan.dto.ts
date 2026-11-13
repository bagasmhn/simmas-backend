import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePenempatanDto {
  @ApiPropertyOptional({ example: 1, description: 'ID perusahaan mitra baru' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  dudiId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID guru pembimbing baru' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  guruPembimbingId?: number;

  @ApiPropertyOptional({ example: 'Peserta magang' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  posisi?: string;
}
