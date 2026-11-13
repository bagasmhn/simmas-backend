import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FilterSiswaDto {
  @ApiPropertyOptional({
    example: 'XII RPL 1',
    description: 'Filter siswa berdasarkan kelas',
  })
  @IsOptional()
  @IsString()
  kelas?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter siswa berdasarkan ID Industri (DUDI / Mitra tempat magang yang disetujui)',
  })
  @IsOptional()
  dudiId?: string; // string or number from query

  @ApiPropertyOptional({
    enum: Status,
    example: Status.BELUM_MAGANG,
    description: 'Filter berdasarkan status siswa',
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
