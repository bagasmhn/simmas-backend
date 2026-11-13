import { IsNotEmpty, IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateKunjunganDto {
  @ApiProperty({ example: 1, description: 'ID DUDI / Perusahaan mitra tempat kunjungan' })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  dudiId: number;

  @ApiProperty({ example: '2026-11-12T00:00:00.000Z', description: 'Tanggal kunjungan guru' })
  @IsDateString()
  @IsNotEmpty()
  tanggalKunjungan: string;

  @ApiProperty({ example: 'Siswa menunjukkan kemajuan yang sangat baik dalam pengerjaan project', description: 'Catatan evaluasi kunjungan' })
  @IsString()
  @IsNotEmpty()
  catatanEvaluasi: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Foto dokumentasi kunjungan (opsional)' })
  @IsOptional()
  foto?: any;
}
