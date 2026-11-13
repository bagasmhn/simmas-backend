import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GuruService } from './guru.service';
import { JwtAuthGuard } from '../admin/guard/jwt-auth.guard';
import { RolesGuard } from '../admin/guard/roles.guard';
import { Roles } from '../admin/decorators/roles.decorators';
import { UpdateJurnalStatusDto } from './dto/update-jurnal-status.dto';
import { CreateKunjunganDto } from './dto/create-kunjungan.dto';
import { NilaiPklDto } from './dto/nilai-pkl.dto';

@ApiTags('Guru')
@Controller('guru')
export class GuruController {
  constructor(private readonly guruService: GuruService) {}

  @Get('siswa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GURU)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guru melihat daftar siswa yang memilih guru pembimbing tersebut' })
  findSiswaBimbingan(@Request() req) {
    return this.guruService.findSiswaBimbingan(req.user.id);
  }

  @Get('siswa/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GURU)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guru melihat detail siswa bimbingan (tempat magang, periode pelaksanaan, statistik kehadiran, dan riwayat absensi)' })
  findDetailSiswaBimbingan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.guruService.findDetailSiswaBimbingan(req.user.id, id);
  }

  @Get('dudi-bimbingan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GURU)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guru melihat daftar DUDI/perusahaan tempat magang yang dipilih oleh siswa bimbingannya' })
  getDudiBimbingan(@Request() req) {
    return this.guruService.getDudiBimbingan(req.user.id);
  }

  @Post('kunjungan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GURU)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['dudiId', 'tanggalKunjungan', 'catatanEvaluasi'],
      properties: {
        dudiId: {
          type: 'integer',
          example: 1,
          description: 'ID DUDI / Perusahaan mitra (harus merupakan tempat magang dari siswa bimbingan guru ini)',
        },
        tanggalKunjungan: {
          type: 'string',
          example: '2026-11-12T00:00:00.000Z',
          description: 'Tanggal kunjungan guru',
        },
        catatanEvaluasi: {
          type: 'string',
          example: 'Siswa menunjukkan kemajuan yang sangat baik dalam pengerjaan project',
          description: 'Catatan evaluasi kunjungan',
        },
        foto: {
          type: 'string',
          format: 'binary',
          description: 'Foto dokumentasi kunjungan (opsional)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Guru menambahkan catatan kunjungan ke DUDI (nama dudi, tanggal kunjungan, catatan evaluasi, upload foto)' })
  buatKunjungan(
    @Request() req,
    @Body() dto: CreateKunjunganDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.guruService.buatKunjungan(req.user.id, dto, file);
  }

  @Get('kunjungan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GURU)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guru melihat riwayat kunjungan yang telah dibuat' })
  findKunjunganSaya(@Request() req) {
    return this.guruService.findKunjunganSaya(req.user.id);
  }

  @Post('siswa/:id/nilai')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GURU)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guru memberi nilai PKL siswa bimbingan; jika nilai > 75, status siswa otomatis LULUS' })
  nilaiSiswaBimbingan(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NilaiPklDto,
  ) {
    return this.guruService.nilaiSiswaBimbingan(req.user.id, id, dto);
  }

  @Get('jurnal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GURU)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guru melihat daftar jurnal dari siswa yang dibimbing' })
  findJurnalBimbingan(@Request() req) {
    return this.guruService.findJurnalBimbingan(req.user.id);
  }

  @Patch('jurnal/:id/keputusan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GURU)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guru memilih keputusan minta revisi atau setujui jurnal beserta catatan (opsional)' })
  updateJurnalStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJurnalStatusDto,
  ) {
    return this.guruService.updateJurnalStatus(req.user.id, id, dto);
  }
}
