import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordSiswaDto {
  @ApiProperty({ example: 'passwordLama123', description: 'Password saat ini' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    example: 'passwordBaru123',
    description: 'Password baru (minimal 6 karakter)',
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
