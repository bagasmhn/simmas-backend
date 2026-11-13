import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status, StatusAbsen } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDudiDto } from '../admin/dto/create-dudi.dto';
import { CloudinaryService } from '../common/cloudinary.service';
import { CreateJurnalDto } from './dto/create-jurnal.dto';
import { CreateAbsenDto } from './dto/create-absen.dto';
import type { RegisterResponseDto } from '../admin/admin.service';

@Injectable()
export class SiswaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private getTodayDateOnly(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  async getDashboardSiswa(siswaId: number) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { id: true, nama: true, email: true, nis: true, kelas: true, status: true },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const listDudi = await this.prisma.mitra.findMany({
      where: { status: Status.TERVERIFIKASI },
      orderBy: { createdAt: 'desc' },
    });

    const pengajuan = await this.prisma.pengajuanMagang.findMany({
      where: { siswaId },
      include: {
        dudi: true,
        guruPembimbing: {
          select: {
            id: true,
            namalengkap: true,
            email: true,
            jurusan: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const jurnal = await this.prisma.jurnalSiswa.findMany({
      where: { siswaId },
      include: {
        guruPembimbing: {
          select: { id: true, namalengkap: true, email: true, jurusan: true },
        },
      },
      orderBy: { tanggalPelaksana: 'desc' },
    });

    const absenHariIni = await this.prisma.absenSiswa.findFirst({
      where: {
        siswaId,
        tanggal: this.getTodayDateOnly(),
      },
    });

    const riwayatAbsen = await this.prisma.absenSiswa.findMany({
      where: { siswaId },
      orderBy: { tanggal: 'desc' },
    });

    return {
      message: 'Berhasil memuat dashboard siswa',
      data: {
        siswa,
        list_dudi_disetujui: listDudi,
        pengajuan_magang: pengajuan,
        jurnal_siswa: jurnal,
        absen_hari_ini: absenHariIni,
        riwayat_absen: riwayatAbsen,
      },
    };
  }

  async checkInAbsen(
    siswaId: number,
    dto: CreateAbsenDto,
    file?: Express.Multer.File,
  ) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id: siswaId } });
    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const today = this.getTodayDateOnly();

    const existing = await this.prisma.absenSiswa.findUnique({
      where: {
        siswaId_tanggal: {
          siswaId,
          tanggal: today,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Anda sudah melakukan absen masuk untuk hari ini');
    }

    let fotoMasukUrl: string | null = null;
    let keteranganFinal: string | null = null;

    if (dto.statusAbsen === StatusAbsen.HADIR) {
      if (!file) {
        throw new BadRequestException('Absen HADIR wajib menyertakan foto selfie (kamera)');
      }
      fotoMasukUrl = await this.cloudinaryService.uploadImage(file);
    } else {
      if (!dto.keterangan || dto.keterangan.trim() === '') {
        throw new BadRequestException(`Keterangan wajib diisi untuk status ${dto.statusAbsen}`);
      }
      keteranganFinal = dto.keterangan;
    }

    const absen = await this.prisma.absenSiswa.create({
      data: {
        siswaId,
        tanggal: today,
        statusAbsen: dto.statusAbsen,
        fotoMasukUrl,
        keterangan: keteranganFinal,
        jamMasuk: new Date(),
      },
    });

    return {
      message: `Absen masuk (${dto.statusAbsen}) berhasil direkam`,
      data: absen,
    };
  }

  async checkOutAbsen(siswaId: number, file?: Express.Multer.File) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id: siswaId } });
    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const today = this.getTodayDateOnly();

    const absen = await this.prisma.absenSiswa.findUnique({
      where: {
        siswaId_tanggal: {
          siswaId,
          tanggal: today,
        },
      },
    });

    if (!absen) {
      throw new BadRequestException('Anda belum melakukan absen masuk hari ini');
    }

    if (absen.statusAbsen !== StatusAbsen.HADIR) {
      throw new BadRequestException('Absen dengan status IZIN atau SAKIT tidak dapat melakukan checkout');
    }

    if (absen.jamKeluar) {
      throw new BadRequestException('Anda sudah melakukan checkout hari ini');
    }

    if (!file) {
      throw new BadRequestException('Checkout wajib menyertakan foto selfie (kamera)');
    }

    const fotoKeluarUrl = await this.cloudinaryService.uploadImage(file);

    const updated = await this.prisma.absenSiswa.update({
      where: { id: absen.id },
      data: {
        jamKeluar: new Date(),
        fotoKeluarUrl,
      },
    });

    return {
      message: 'Checkout absensi berhasil direkam dengan foto selfie',
      data: updated,
    };
  }

  async ajukanMagang(siswaId: number, dto: { dudiId: number; posisi: string }) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id: siswaId } });
    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const dudi = await this.prisma.mitra.findUnique({ where: { id: dto.dudiId } });
    if (!dudi) {
      throw new NotFoundException('Tempat magang (DUDI) tidak ditemukan');
    }

    if (dudi.status !== Status.TERVERIFIKASI) {
      throw new BadRequestException('Tempat magang belum disetujui / terverifikasi oleh admin');
    }

    const pengajuan = await this.prisma.pengajuanMagang.create({
      data: {
        siswaId,
        dudiId: dto.dudiId,
        posisi: dto.posisi,
        status: Status.DITINJAU_SEKOLAH,
      },
      include: { dudi: true },
    });

    return {
      message: 'Pengajuan magang berhasil dikirim dan sedang ditinjau sekolah',
      data: pengajuan,
    };
  }

  async tambahJurnal(
    siswaId: number,
    dto: CreateJurnalDto,
    file?: Express.Multer.File,
  ) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id: siswaId } });
    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const pengajuanAktif = await this.prisma.pengajuanMagang.findFirst({
      where: {
        siswaId,
        status: Status.DISETUJUI,
      },
    });

    let guruPembimbingId: number | null = null;
    if (pengajuanAktif && pengajuanAktif.guruPembimbingId) {
      guruPembimbingId = pengajuanAktif.guruPembimbingId;
    } else {
      const pengajuanGuru = await this.prisma.pengajuanMagang.findFirst({
        where: { siswaId, guruPembimbingId: { not: null } },
      });
      if (pengajuanGuru) {
        guruPembimbingId = pengajuanGuru.guruPembimbingId;
      }
    }

    let fotoUrl: string | null = null;
    if (file) {
      fotoUrl = await this.cloudinaryService.uploadImage(file);
    }

    const jurnal = await this.prisma.jurnalSiswa.create({
      data: {
        siswaId,
        guruPembimbingId,
        tanggalPelaksana: new Date(dto.tanggalPelaksana),
        rincianKegiatan: dto.rincianKegiatan,
        kendalaMasalah: dto.kendalaMasalah,
        tindakLanjut: dto.tindakLanjut,
        fotoUrl,
        status: Status.MENUNGGU,
      },
      include: {
        guruPembimbing: {
          select: { id: true, namalengkap: true, email: true, jurusan: true },
        },
      },
    });

    return {
      message: 'Jurnal magang berhasil ditambahkan dengan status MENUNGGU',
      data: jurnal,
    };
  }

  async findJurnalSaya(siswaId: number) {
    const jurnal = await this.prisma.jurnalSiswa.findMany({
      where: { siswaId },
      include: {
        guruPembimbing: {
          select: { id: true, namalengkap: true, email: true, jurusan: true },
        },
      },
      orderBy: { tanggalPelaksana: 'desc' },
    });

    return {
      message: 'Berhasil memuat jurnal milik siswa',
      data: jurnal,
    };
  }

  async updateJurnalSaya(
    siswaId: number,
    jurnalId: number,
    dto: {
      tanggalPelaksana?: string;
      rincianKegiatan?: string;
      kendalaMasalah?: string;
      tindakLanjut?: string;
    },
    file?: Express.Multer.File,
  ) {
    const jurnal = await this.prisma.jurnalSiswa.findFirst({
      where: { id: jurnalId, siswaId },
    });

    if (!jurnal) {
      throw new NotFoundException('Jurnal tidak ditemukan');
    }

    let tanggalPelaksana: Date | undefined;
    if (dto.tanggalPelaksana !== undefined) {
      tanggalPelaksana = new Date(dto.tanggalPelaksana);
      if (Number.isNaN(tanggalPelaksana.getTime())) {
        throw new BadRequestException('Format tanggal pelaksana tidak valid');
      }
    }

    const fotoUrl = file
      ? await this.cloudinaryService.uploadImage(file)
      : undefined;

    const updated = await this.prisma.jurnalSiswa.update({
      where: { id: jurnalId },
      data: {
        ...(tanggalPelaksana && { tanggalPelaksana }),
        ...(dto.rincianKegiatan !== undefined && {
          rincianKegiatan: dto.rincianKegiatan,
        }),
        ...(dto.kendalaMasalah !== undefined && {
          kendalaMasalah: dto.kendalaMasalah,
        }),
        ...(dto.tindakLanjut !== undefined && {
          tindakLanjut: dto.tindakLanjut,
        }),
        ...(fotoUrl !== undefined && { fotoUrl }),
      },
      include: {
        guruPembimbing: {
          select: { id: true, namalengkap: true, email: true, jurusan: true },
        },
      },
    });

    return {
      message: 'Jurnal berhasil diperbarui',
      data: updated,
    };
  }

  async deleteJurnalSaya(siswaId: number, jurnalId: number) {
    const result = await this.prisma.jurnalSiswa.deleteMany({
      where: { id: jurnalId, siswaId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Jurnal tidak ditemukan');
    }

    return { message: 'Jurnal berhasil dihapus' };
  }

  async changePassword(
    siswaId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id: siswaId } });

    if (!siswa) {
      throw new NotFoundException('Akun siswa tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(currentPassword, siswa.password);
    if (!isMatch) {
      throw new BadRequestException('Password saat ini salah');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.siswa.update({
      where: { id: siswaId },
      data: { password: hashed },
    });

    return { message: 'Password berhasil diubah' };
  }

  async createDudi(dto: CreateDudiDto): Promise<
    RegisterResponseDto<{
      id: number;
      nama_perusahaan: string;
      alamat: string;
      bidang_usaha: string;
      kuota_peserta: boolean;
      penanggung_jawab: string;
      kontak: string;
      status: Status;
      createdAt: Date;
    }>
  > {
    const dudi = await this.prisma.mitra.create({
      data: {
        nama_perusahaan: dto.nama_perusahaan,
        alamat: dto.alamat,
        bidang_usaha: dto.bidang_usaha,
        kuota_peserta: dto.kuota_peserta,
        penanggung_jawab: dto.penanggung_jawab,
        kontak: dto.kontak,
      },
      select: {
        id: true,
        nama_perusahaan: true,
        alamat: true,
        bidang_usaha: true,
        kuota_peserta: true,
        penanggung_jawab: true,
        kontak: true,
        status: true,
        createdAt: true,
      },
    });

    return { message: 'Perusahaan berhasil ditambahkan', data: dudi };
  }
}
