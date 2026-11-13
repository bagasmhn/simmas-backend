import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJurnalDto {
  @ApiProperty({ example: '2026-11-12T00:00:00.000Z', description: 'Tanggal pelaksana kegiatan magang' })
  @IsString()
  @IsNotEmpty()
  tanggalPelaksana!: string;

  @ApiProperty({ example: 'Membuat halaman login dan dashboard menggunakan NestJS dan React', description: 'Rincian kegiatan magang' })
  @IsString()
  @IsNotEmpty()
  rincianKegiatan!: string;

  @ApiPropertyOptional({ example: 'Koneksi database sempat terputus', description: 'Kendala atau masalah (opsional)' })
  @IsString()
  @IsOptional()
  kendalaMasalah?: string;

  @ApiPropertyOptional({ example: 'Melakukan re-connect pooler database', description: 'Tindak lanjut (opsional)' })
  @IsString()
  @IsOptional()
  tindakLanjut?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Foto dokumentasi kegiatan magang (opsional)' })
  @IsOptional()
  foto?: any;
}
