import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSiswaDto {
  @ApiPropertyOptional({
    example: 'Andi Pratama',
    description: 'Nama lengkap siswa',
  })
  @IsString()
  @IsOptional()
  namalengkap?: string;

  @ApiPropertyOptional({ example: '0012345678' })
  @IsString()
  @IsOptional()
  nis?: string;

  @ApiPropertyOptional({ example: 'XII RPL 1' })
  @IsString()
  @IsOptional()
  kelas?: string;
}
