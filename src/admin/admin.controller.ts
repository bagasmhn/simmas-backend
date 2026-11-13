import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from './decorators/roles.decorators';
import { CreateDudiDto } from './dto/create-dudi.dto';
import { UpdateDudiDto } from './dto/update-dudi.dto';
import { FilterDudiDto } from './dto/filter-dudi.dto';
import { FilterGuruDto } from './dto/filter-guru.dto';
import { FilterSiswaDto } from './dto/filter-siswa.dto';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { UpdateStatusGuruDto } from './dto/update-status-guru.dto';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { UpdateStatusSiswaDto } from './dto/update-status-siswa.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AjukanMagangDto } from './dto/ajukan-magang.dto';
import { UpdateStatusPengajuanDto } from './dto/update-status-pengajuan.dto';
import { FilterPenempatanDto } from './dto/filter-penempatan.dto';
import { UpdatePenempatanDto } from './dto/update-penempatan.dto';
import { UpdateStatusPenempatanDto } from './dto/update-status-penempatan.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/roles.guard';

@ApiTags('Admin')
@Controller('/')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('admin/monitoring/siswa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin monitoring siswa: menampilkan nama siswa, kelas, dudi, pembimbing, kehadiran (H, S, I), jumlah jurnal, dan status' })
  @ApiQuery({ name: 'kelas', required: false, description: 'Filter berdasarkan kelas (contoh: XII RPL 1)' })
  getMonitoringSiswa(@Query('kelas') kelas?: string) {
    return this.adminService.getMonitoringSiswa(kelas);
  }

  @Get('admin/monitoring/kunjungan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin monitoring kunjungan: menampilkan data kunjungan semua guru (tanggal, guru pembimbing, tempat magang, catatan kunjungan)' })
  getMonitoringKunjungan() {
    return this.adminService.getMonitoringKunjungan();
  }

  @Get('admin/pengajuan-magang')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin melihat pengajuan magang yang menunggu keputusan' })
  findPengajuanMagangMenungguKeputusan() {
    return this.adminService.findPengajuanMagangMenungguKeputusan();
  }

  @Patch('admin/pengajuan-magang/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin menyetujui atau menolak pengajuan magang' })
  updateStatusPengajuanMagang(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusPengajuanDto,
  ) {
    return this.adminService.updateStatusPengajuanMagang(
      id,
      dto.status,
      dto.guruPembimbingId,
    );
  }

  @Post('admin/guru')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin mendaftarkan guru' })
  registerGuru(
    @Body() dto: CreateGuruDto,
  ): ReturnType<AdminService['registerGuru']> {
    return this.adminService.registerGuru(dto);
  }

  @Post('admin/siswa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin mendaftarkan siswa' })
  registerSiswa(
    @Body() dto: CreateSiswaDto,
  ): ReturnType<AdminService['registerSiswa']> {
    return this.adminService.registerSiswa(dto);
  }

  @Post('admin/perusahaan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SISWA)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin menambahkan perusahaan mitra' })
  createDudi(
    @Body() dto: CreateDudiDto,
  ): ReturnType<AdminService['createDudi']> {
    return this.adminService.createDudi(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/mitra')
  @ApiOperation({ summary: 'Admin melihat semua mitra (bisa filter status)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['TERVERIFIKASI', 'MENUNGGU_VALIDASI'],
    description: 'Filter status perusahaan',
  })
  findAllAdmin(@Query() filter: FilterDudiDto) {
    return this.adminService.findAllAdmin(filter.status);
  }

  @Patch('admin/mitra/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin mengedit data perusahaan mitra' })
  updateDudi(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDudiDto,
  ) {
    return this.adminService.updateDudi(id, dto);
  }

  @Delete('admin/mitra/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin menghapus data perusahaan mitra' })
  deleteDudi(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteDudi(id);
  }

  @Get('admin/guru')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin melihat semua data guru (bisa filter jurusan & status)' })
  @ApiQuery({ name: 'jurusan', required: false, enum: ['RPL', 'TKJ', 'MM'], description: 'Filter berdasarkan jurusan' })
  @ApiQuery({ name: 'status', required: false, enum: ['AKTIF', 'NONAKTIF'], description: 'Filter berdasarkan status' })
  findAllGuru(@Query() filter: FilterGuruDto) {
    return this.adminService.findAllGuru(filter);
  }

  @Patch('admin/guru/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin mengedit data guru' })
  updateGuru(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGuruDto,
  ) {
    return this.adminService.updateGuru(id, dto);
  }

  @Delete('admin/guru/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin menghapus data guru' })
  deleteGuru(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteGuru(id);
  }

  @Patch('admin/guru/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin mengubah status guru (AKTIF / NONAKTIF)' })
  updateStatusGuru(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusGuruDto,
  ) {
    return this.adminService.updateStatusGuru(id, dto);
  }

  @Get('admin/siswa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin melihat semua data siswa (bisa filter kelas, dudiId, dan status)' })
  @ApiQuery({ name: 'kelas', required: false, description: 'Filter berdasarkan kelas (contoh: XII RPL 1)' })
  @ApiQuery({ name: 'dudiId', required: false, description: 'Filter berdasarkan ID Industri / DUDI tempat magang' })
  @ApiQuery({ name: 'status', required: false, enum: ['BELUM_MAGANG', 'SEDANG_MAGANG', 'LULUS'], description: 'Filter berdasarkan status siswa' })
  findAllSiswa(@Query() filter: FilterSiswaDto) {
    return this.adminService.findAllSiswa(filter);
  }

  @Get('admin/penempatan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin melihat penempatan siswa dan memfilter kelas, perusahaan, atau status',
  })
  @ApiQuery({ name: 'kelas', required: false, example: 'XII RPL 1' })
  @ApiQuery({ name: 'dudiId', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['SEDANG_MAGANG', 'LULUS'],
  })
  findAllPenempatan(@Query() filter: FilterPenempatanDto) {
    return this.adminService.findAllPenempatan(filter);
  }

  @Patch('admin/penempatan/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin mengubah perusahaan, guru pembimbing, atau posisi penempatan siswa',
  })
  updatePenempatan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePenempatanDto,
  ) {
    return this.adminService.updatePenempatan(id, dto);
  }

  @Patch('admin/penempatan/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin mengubah status penempatan menjadi SEDANG_MAGANG atau LULUS',
  })
  updateStatusPenempatan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusPenempatanDto,
  ) {
    return this.adminService.updateStatusPenempatan(id, dto.status);
  }

  @Delete('admin/penempatan/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin menghapus penempatan siswa dan mengembalikan statusnya ke BELUM_MAGANG',
  })
  deletePenempatan(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePenempatan(id);
  }

  @Patch('admin/siswa/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin mengedit data siswa' })
  updateSiswa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSiswaDto,
  ) {
    return this.adminService.updateSiswa(id, dto);
  }

  @Delete('admin/siswa/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin menghapus data siswa' })
  deleteSiswa(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteSiswa(id);
  }

  @Patch('admin/siswa/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin mengubah status siswa (BELUM_MAGANG / SEDANG_MAGANG / LULUS)',
  })
  updateStatusSiswa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusSiswaDto,
  ) {
    return this.adminService.updateStatusSiswa(id, dto);
  }

  @Patch('admin/mitra/:id/verifikasi')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin memverifikasi perusahaan mitra' })
  approveDudi(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approve(id);
  }

  @Patch('admin/akun/ganti-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin mengganti password akun sendiri' })
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.adminService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
