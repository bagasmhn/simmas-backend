import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsIn } from 'class-validator';

export class UpdateStatusPenempatanDto {
  @ApiProperty({
    enum: [Status.SEDANG_MAGANG, Status.LULUS],
    example: Status.LULUS,
  })
  @IsIn([Status.SEDANG_MAGANG, Status.LULUS], {
    message: 'Status penempatan hanya boleh SEDANG_MAGANG atau LULUS',
  })
  status!: Status;
}
