import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateDudiDto {
  @IsString()
  @IsNotEmpty()
  nama_perusahaan!: string;

  @IsString()
  @IsNotEmpty()
  alamat!: string;

  @IsString()
  @IsNotEmpty()
  bidang_usaha!: string;

  @IsBoolean()
  kuota_peserta!: boolean;

  @IsString()
  @IsNotEmpty()
  penanggung_jawab!: string;

  @IsString()
  @IsNotEmpty()
  kontak!: string;
}
