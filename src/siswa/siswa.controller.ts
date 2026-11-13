import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiswaService } from './siswa.service';
import { AjukanMagangDto } from '../admin/dto/ajukan-magang.dto';
import { JwtAuthGuard } from '../admin/guard/jwt-auth.guard';
import { RolesGuard } from '../admin/guard/roles.guard';
import { Roles } from '../admin/decorators/roles.decorators';
import { ChangePasswordSiswaDto } from './dto/change-password-siswa.dto';
import { CreateDudiDto } from '../admin/dto/create-dudi.dto';
import { CreateJurnalDto } from './dto/create-jurnal.dto';
import { UpdateJurnalDto } from './dto/update-jurnal.dto';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { CheckoutAbsenDto } from './dto/checkout-absen.dto';

@ApiTags('Siswa')
@Controller('siswa')
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard siswa: menampilkan semua DUDI yang telah disetujui admin serta status pengajuan magang siswa' })
  getDashboardSiswa(@Request() req) {
    return this.siswaService.getDashboardSiswa(req.user.id);
  }

  @Patch('akun/ganti-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Siswa mengganti password akun sendiri' })
  changePassword(@Request() req, @Body() dto: ChangePasswordSiswaDto) {
    return this.siswaService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('pengajuan-magang')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Siswa mengajukan tempat dan posisi magang (status otomatis DITINJAU_SEKOLAH)' })
  ajukanMagang(@Request() req, @Body() dto: AjukanMagangDto) {
    return this.siswaService.ajukanMagang(req.user.id, dto);
  }

  @Post('absen/masuk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['statusAbsen'],
      properties: {
        statusAbsen: {
          type: 'string',
          enum: ['HADIR', 'IZIN', 'SAKIT'],
          example: 'HADIR',
          description: 'Pilihan status absen: HADIR, IZIN, atau SAKIT',
        },
        keterangan: {
          type: 'string',
          example: 'Demam tinggi / berobat ke dokter',
          description: 'Wajib diisi jika status IZIN atau SAKIT (tidak perlu jika HADIR)',
        },
        foto: {
          type: 'string',
          format: 'binary',
          description: 'Foto selfie kehadiran dari kamera (wajib diisi jika status HADIR)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Siswa melakukan absen masuk (HADIR otomatis buka kamera & upload foto; IZIN/SAKIT wajib mengisi keterangan tanpa foto)' })
  checkInAbsen(
    @Request() req,
    @Body() dto: CreateAbsenDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.siswaService.checkInAbsen(req.user.id, dto, file);
  }

  @Post('absen/keluar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        foto: {
          type: 'string',
          format: 'binary',
          description: 'Foto selfie checkout / pulang (wajib diisi)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Siswa melakukan absen pulang / checkout (wajib menyertakan foto selfie kamera dan hanya bisa dipencet jika checkin berstatus HADIR)' })
  checkOutAbsen(
    @Request() req,
    @Body() dto: CheckoutAbsenDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.siswaService.checkOutAbsen(req.user.id, file);
  }

  @Post('jurnal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tanggalPelaksana', 'rincianKegiatan'],
      properties: {
        tanggalPelaksana: {
          type: 'string',
          example: '2026-11-12T00:00:00.000Z',
          description: 'Tanggal pelaksana kegiatan magang',
        },
        rincianKegiatan: {
          type: 'string',
          example: 'Membuat halaman login dan dashboard menggunakan NestJS dan React',
          description: 'Rincian kegiatan magang',
        },
        kendalaMasalah: {
          type: 'string',
          description: 'Kendala atau masalah (opsional)',
        },
        tindakLanjut: {
          type: 'string',
          description: 'Tindak lanjut (opsional)',
        },
        foto: {
          type: 'string',
          format: 'binary',
          description: 'Foto dokumentasi kegiatan magang (opsional)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Siswa menambahkan jurnal kegiatan magang (tanggalPelaksana, rincianKegiatan, kendalaMasalah, tindakLanjut, foto opsional, status default MENUNGGU)' })
  tambahJurnal(
    @Request() req,
    @Body() dto: CreateJurnalDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.siswaService.tambahJurnal(req.user.id, dto, file);
  }

  @Get('jurnal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Siswa melihat semua jurnal miliknya sendiri' })
  findJurnalSaya(@Request() req) {
    return this.siswaService.findJurnalSaya(req.user.id);
  }

  @Patch('jurnal/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tanggalPelaksana: { type: 'string', example: '2026-11-12T00:00:00.000Z' },
        rincianKegiatan: { type: 'string' },
        kendalaMasalah: { type: 'string', description: 'Kendala atau masalah (opsional)' },
        tindakLanjut: { type: 'string', description: 'Tindak lanjut (opsional)' },
        foto: { type: 'string', format: 'binary', description: 'Foto baru (opsional)' },
      },
    },
  })
  @ApiOperation({ summary: 'Siswa mengedit jurnal miliknya sendiri; hanya field yang dikirim yang diperbarui' })
  updateJurnalSaya(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJurnalDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.siswaService.updateJurnalSaya(req.user.id, id, dto, file);
  }

  @Delete('jurnal/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Siswa menghapus jurnal miliknya sendiri' })
  deleteJurnalSaya(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.siswaService.deleteJurnalSaya(req.user.id, id);
  }

  @Post('admin/perusahaan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SISWA)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Siswa menambahkan perusahaan mitra' })
  createDudi(
    @Body() dto: CreateDudiDto,
  ): ReturnType<SiswaService['createDudi']> {
    return this.siswaService.createDudi(dto);
  }
}
