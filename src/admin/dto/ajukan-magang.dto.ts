import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AjukanMagangDto {
  @ApiProperty({ example: 1, description: 'ID DUDI / Mitra yang sudah disetujui admin' })
  @IsNotEmpty()
  @IsNumber()
  dudiId!: number;

  @ApiProperty({ example: 'Frontend Developer', description: 'Posisi magang yang diinginkan' })
  @IsNotEmpty()
  @IsString()
  posisi!: string;
}
