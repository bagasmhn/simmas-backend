import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NilaiPklDto {
  @ApiProperty({
    example: 85.5,
    description: 'Nilai PKL siswa (angka 0 s.d. 100). Jika > 75, status siswa otomatis LULUS',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  nilai: number;

  @ApiPropertyOptional({
    example: 'Siswa sangat kompeten dan disiplin selama PKL',
    description: 'Catatan tambahan penilaian',
  })
  @IsOptional()
  @IsString()
  catatan?: string;
}
