import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDudiDto {
  @ApiPropertyOptional({ example: 'PT Maju Bersama' })
  @IsString()
  @IsOptional()
  nama_perusahaan?: string;

  @ApiPropertyOptional({ example: 'Jl. Sudirman No. 10, Jakarta' })
  @IsString()
  @IsOptional()
  alamat?: string;

  @ApiPropertyOptional({ example: 'Teknologi Informasi' })
  @IsString()
  @IsOptional()
  bidang_usaha?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  kuota_peserta?: boolean;

  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsString()
  @IsOptional()
  penanggung_jawab?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsString()
  @IsOptional()
  kontak?: string;
}
