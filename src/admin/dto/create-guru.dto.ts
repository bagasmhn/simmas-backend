import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Jurusan } from '@prisma/client';

export class CreateGuruDto {
  @IsString()
  @IsNotEmpty()
  namalengkap!: string;

  @IsString()
  @IsNotEmpty()
  nip!: string;

  @IsEnum(Jurusan, {
    message: 'Jurusan harus RPL, TKJ, atau MM',
  })
  jurusan!: Jurusan;
}
