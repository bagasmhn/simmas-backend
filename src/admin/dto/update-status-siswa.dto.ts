import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusSiswaDto {
  @ApiProperty({
    enum: [Status.BELUM_MAGANG, Status.SEDANG_MAGANG, Status.LULUS],
    example: Status.SEDANG_MAGANG,
    description: 'Status siswa: BELUM_MAGANG, SEDANG_MAGANG, atau LULUS',
  })
  @IsEnum([Status.BELUM_MAGANG, Status.SEDANG_MAGANG, Status.LULUS], {
    message: 'Status harus BELUM_MAGANG, SEDANG_MAGANG, atau LULUS',
  })
  @IsNotEmpty()
  status: Status;
}
