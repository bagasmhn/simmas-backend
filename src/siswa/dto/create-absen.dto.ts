import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusAbsen } from '@prisma/client';

export class CreateAbsenDto {
  @ApiProperty({ enum: StatusAbsen, example: StatusAbsen.HADIR, description: 'Status absen: HADIR, IZIN, atau SAKIT' })
  @IsEnum(StatusAbsen)
  @IsNotEmpty()
  statusAbsen: StatusAbsen;

  @ApiPropertyOptional({ example: 'Demam tinggi dan berobat ke dokter', description: 'Keterangan izin atau sakit (wajib diisi jika status IZIN atau SAKIT)' })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Foto selfie kehadiran (wajib diisi jika status HADIR)' })
  @IsOptional()
  foto?: any;
}
