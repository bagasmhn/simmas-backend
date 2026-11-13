import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateJurnalDto {
  @ApiPropertyOptional({
    example: '2026-11-12T00:00:00.000Z',
    description: 'Tanggal pelaksana kegiatan magang',
  })
  @IsString()
  @IsOptional()
  tanggalPelaksana?: string;

  @ApiPropertyOptional({ description: 'Rincian kegiatan magang' })
  @IsString()
  @IsOptional()
  rincianKegiatan?: string;

  @ApiPropertyOptional({ description: 'Kendala atau masalah' })
  @IsString()
  @IsOptional()
  kendalaMasalah?: string;

  @ApiPropertyOptional({ description: 'Tindak lanjut' })
  @IsString()
  @IsOptional()
  tindakLanjut?: string;
}
