import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginSiswaDto {
  @ApiProperty({ example: 'budi@simmas.sch.id' })
  @IsNotEmpty()
  @IsString()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
