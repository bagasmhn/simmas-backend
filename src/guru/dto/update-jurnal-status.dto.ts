import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class UpdateJurnalStatusDto {
  @ApiProperty({ enum: [Status.REVISI, Status.DISETUJUI_GURU], example: Status.DISETUJUI_GURU, description: 'Keputusan guru: REVISI atau DISETUJUI_GURU' })
  @IsEnum(Status)
  @IsNotEmpty()
  status: Status;

  @ApiPropertyOptional({ example: 'Tolong perbaiki bagian rincian kegiatan agar lebih detail', description: 'Catatan dari guru (opsional)' })
  @IsString()
  @IsOptional()
  catatanGuru?: string;
}
