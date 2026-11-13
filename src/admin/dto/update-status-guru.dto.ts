import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusGuruDto {
  @ApiProperty({
    enum: [Status.AKTIF, Status.NONAKTIF],
    example: Status.AKTIF,
    description: 'Status akun guru: AKTIF atau NONAKTIF',
  })
  @IsEnum([Status.AKTIF, Status.NONAKTIF], {
    message: 'Status harus AKTIF atau NONAKTIF',
  })
  @IsNotEmpty()
  status: Status;
}
