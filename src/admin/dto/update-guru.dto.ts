import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Jurusan } from '@prisma/client';

export class UpdateGuruDto {
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsString()
  @IsOptional()
  namalengkap?: string;

  @ApiPropertyOptional({ example: '198501012010011001' })
  @IsString()
  @IsOptional()
  nip?: string;

  @ApiPropertyOptional({ enum: Jurusan, example: Jurusan.RPL })
  @IsEnum(Jurusan, { message: 'Jurusan harus RPL, TKJ, atau MM' })
  @IsOptional()
  jurusan?: Jurusan;
}
