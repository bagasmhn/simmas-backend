import { ApiPropertyOptional } from '@nestjs/swagger';
import { Jurusan, Status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class FilterGuruDto {
  @ApiPropertyOptional({
    enum: Jurusan,
    example: Jurusan.RPL,
    description: 'Filter berdasarkan jurusan: RPL, TKJ, atau MM',
  })
  @IsOptional()
  @IsEnum(Jurusan, { message: 'Jurusan harus RPL, TKJ, atau MM' })
  jurusan?: Jurusan;

  @ApiPropertyOptional({
    enum: [Status.AKTIF, Status.NONAKTIF],
    example: Status.AKTIF,
    description: 'Filter berdasarkan status: AKTIF atau NONAKTIF',
  })
  @IsOptional()
  @IsEnum([Status.AKTIF, Status.NONAKTIF], {
    message: 'Status harus AKTIF atau NONAKTIF',
  })
  status?: Status;
}
