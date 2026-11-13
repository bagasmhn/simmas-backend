import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSiswaDto {
  @IsString()
  @IsNotEmpty()
  nama!: string;

  @IsString()
  @IsNotEmpty()
  nis!: string;

  @IsString()
  @IsNotEmpty()
  kelas!: string;
}
