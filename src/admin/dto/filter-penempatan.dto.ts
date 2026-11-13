import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class FilterPenempatanDto {
  @ApiPropertyOptional({ example: 'XII RPL 1' })
  @IsOptional()
  @IsString()
  kelas?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter berdasarkan ID perusahaan (DUDI)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  dudiId?: number;

  @ApiPropertyOptional({
    enum: [Status.SEDANG_MAGANG, Status.LULUS],
    description: 'Status siswa yang sudah ditempatkan',
  })
  @IsOptional()
  @IsIn([Status.SEDANG_MAGANG, Status.LULUS])
  status?: Status;
}
