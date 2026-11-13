import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class FilterDudiDto {
  @ApiPropertyOptional({
    enum: [Status.TERVERIFIKASI, Status.MENUNGGU_VALIDASI],
    example: Status.TERVERIFIKASI,
    description: 'Filter status mitra: TERVERIFIKASI atau MENUNGGU_VALIDASI',
  })
  @IsOptional()
  @IsEnum([Status.TERVERIFIKASI, Status.MENUNGGU_VALIDASI], {
    message: 'Status harus TERVERIFIKASI atau MENUNGGU_VALIDASI',
  })
  status?: Status;
}
