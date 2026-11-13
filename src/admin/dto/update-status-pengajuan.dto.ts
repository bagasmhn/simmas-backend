import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';

export enum KeputusanPengajuan {
  DISETUJUI = 'DISETUJUI',
  DITOLAK = 'DITOLAK',
}

export class UpdateStatusPengajuanDto {
  @ApiProperty({
    enum: KeputusanPengajuan,
    example: KeputusanPengajuan.DISETUJUI,
    description: 'Keputusan admin: DISETUJUI atau DITOLAK',
  })
  @IsNotEmpty()
  @IsEnum(KeputusanPengajuan, {
    message: 'Status harus DISETUJUI atau DITOLAK',
  })
  status!: KeputusanPengajuan;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID satu guru aktif yang dipilih sebagai pembimbing',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  guruPembimbingId?: number;
}
