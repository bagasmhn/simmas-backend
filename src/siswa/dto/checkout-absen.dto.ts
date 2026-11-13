import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutAbsenDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Foto selfie checkout / pulang (wajib diisi)' })
  @IsOptional()
  foto?: any;
}
