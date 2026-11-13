import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status, StatusAbsen } from '@prisma/client';
import { CloudinaryService } from '../common/cloudinary.service';
import { UpdateJurnalStatusDto } from './dto/update-jurnal-status.dto';
import { CreateKunjunganDto } from './dto/create-kunjungan.dto';
import { NilaiPklDto } from './dto/nilai-pkl.dto';

@Injectable()
export class GuruService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findSiswaBimbingan(guruId: number) {
    const pengajuan = await this.prisma.pengajuanMagang.findMany({
      where: { guruPembimbingId: guruId },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            email: true,
            nis: true,
            kelas: true,
            status: true,
          },
        },
        dudi: true,
      },
    });

    const mapSiswa = new Map();
    for (const p of pengajuan) {
      if (p.siswa && !mapSiswa.has(p.siswa.id)) {
        mapSiswa.set(p.siswa.id, {
          siswa: p.siswa,
          penempatan: {
            id: p.id,
            posisi: p.posisi,
            statusPengajuan: p.status,
            dudi: p.dudi,
            periodeMulai: p.createdAt,
          },
        });
      }
    }

    return {
      message: 'Berhasil memuat daftar siswa bimbingan',
      data: Array.from(mapSiswa.values()),
    };
  }

  async findDetailSiswaBimbingan(guruId: number, siswaId: number) {
    const pengajuan = await this.prisma.pengajuanMagang.findFirst({
      where: {
        siswaId,
        guruPembimbingId: guruId,
      },
      include: {
        dudi: true,
        siswa: {
          select: {
            id: true,
            nama: true,
            email: true,
            nis: true,
            kelas: true,
            status: true,
          },
        },
      },
    });

    if (!pengajuan) {
      throw new UnauthorizedException('Siswa ini bukan bimbingan Anda');
    }

    const riwayatAbsen = await this.prisma.absenSiswa.findMany({
      where: { siswaId },
      orderBy: { tanggal: 'desc' },
    });

    let totalHadir = 0;
    let totalIzin = 0;
    let totalSakit = 0;

    for (const absen of riwayatAbsen) {
      if (absen.statusAbsen === StatusAbsen.HADIR) totalHadir++;
      else if (absen.statusAbsen === StatusAbsen.IZIN) totalIzin++;
      else if (absen.statusAbsen === StatusAbsen.SAKIT) totalSakit++;
    }

    return {
      message: 'Berhasil memuat detail siswa bimbingan',
      data: {
        siswa: pengajuan.siswa,
        tempat_magang: pengajuan.dudi,
        posisi: pengajuan.posisi,
        periode_pelaksanaan: {
          mulai: pengajuan.createdAt,
          status_pengajuan: pengajuan.status,
        },
        statistik_kehadiran: {
          hadir: totalHadir,
          izin: totalIzin,
          sakit: totalSakit,
          total_absen: riwayatAbsen.length,
        },
        riwayat_absensi: riwayatAbsen,
      },
    };
  }

  async getDudiBimbingan(guruId: number) {
    // Cari semua DUDI yang dipilih/tempat magang oleh siswa bimbingan guru ini
    const pengajuan = await this.prisma.pengajuanMagang.findMany({
      where: { guruPembimbingId: guruId },
      include: { dudi: true },
    });

    const mapDudi = new Map();
    for (const p of pengajuan) {
      if (p.dudi && !mapDudi.has(p.dudi.id)) {
        mapDudi.set(p.dudi.id, p.dudi);
      }
    }

    return {
      message: 'Berhasil memuat daftar DUDI tempat magang siswa bimbingan',
      data: Array.from(mapDudi.values()),
    };
  }

  async buatKunjungan(
    guruId: number,
    dto: CreateKunjunganDto,
    file?: Express.Multer.File,
  ) {
    // Validasi apakah DUDI yang dipilih adalah tempat magang dari siswa bimbingan guru ini
    const pengajuan = await this.prisma.pengajuanMagang.findFirst({
      where: {
        guruPembimbingId: guruId,
        dudiId: dto.dudiId,
      },
    });

    if (!pengajuan) {
      throw new BadRequestException('Perusahaan (DUDI) tersebut bukan tempat magang dari siswa bimbingan Anda');
    }

    let fotoUrl: string | null = null;
    if (file) {
      fotoUrl = await this.cloudinaryService.uploadImage(file);
    }

    const kunjungan = await this.prisma.kunjunganGuru.create({
      data: {
        guruId,
        dudiId: dto.dudiId,
        tanggalKunjungan: new Date(dto.tanggalKunjungan),
        catatanEvaluasi: dto.catatanEvaluasi,
        fotoUrl,
      },
      include: {
        dudi: true,
        guru: {
          select: { id: true, namalengkap: true, email: true, jurusan: true },
        },
      },
    });

    return {
      message: 'Kunjungan guru berhasil direkam',
      data: kunjungan,
    };
  }

  async findKunjunganSaya(guruId: number) {
    const list = await this.prisma.kunjunganGuru.findMany({
      where: { guruId },
      include: {
        dudi: true,
      },
      orderBy: { tanggalKunjungan: 'desc' },
    });

    return {
      message: 'Berhasil memuat riwayat kunjungan guru',
      data: list,
    };
  }

  async findJurnalBimbingan(guruId: number) {
    const pengajuan = await this.prisma.pengajuanMagang.findMany({
      where: { guruPembimbingId: guruId },
      select: { siswaId: true },
    });

    const siswaIds = pengajuan.map((p) => p.siswaId);

    const jurnalList = await this.prisma.jurnalSiswa.findMany({
      where: {
        OR: [
          { guruPembimbingId: guruId },
          { siswaId: { in: siswaIds } },
        ],
      },
      include: {
        siswa: {
          select: {
            id: true,
            nama: true,
            nis: true,
            kelas: true,
          },
        },
        guruPembimbing: {
          select: {
            id: true,
            namalengkap: true,
            email: true,
            jurusan: true,
          },
        },
      },
      orderBy: { tanggalPelaksana: 'desc' },
    });

    return {
      message: 'Berhasil memuat daftar jurnal bimbingan',
      data: jurnalList,
    };
  }

  async updateJurnalStatus(guruId: number, jurnalId: number, dto: UpdateJurnalStatusDto) {
    const jurnal = await this.prisma.jurnalSiswa.findUnique({
      where: { id: jurnalId },
    });

    if (!jurnal) {
      throw new NotFoundException('Jurnal siswa tidak ditemukan');
    }

    const pengajuan = await this.prisma.pengajuanMagang.findFirst({
      where: {
        siswaId: jurnal.siswaId,
        guruPembimbingId: guruId,
      },
    });

    if (!pengajuan && jurnal.guruPembimbingId !== guruId) {
      throw new UnauthorizedException('Anda bukan guru pembimbing untuk siswa ini');
    }

    if (dto.status !== Status.REVISI && dto.status !== Status.DISETUJUI_GURU) {
      throw new BadRequestException('Status keputusan harus REVISI atau DISETUJUI_GURU');
    }

    const updated = await this.prisma.jurnalSiswa.update({
      where: { id: jurnalId },
      data: {
        status: dto.status,
        catatanGuru: dto.catatanGuru ?? jurnal.catatanGuru,
        guruPembimbingId: guruId,
      },
      include: {
        siswa: {
          select: { id: true, nama: true, nis: true, kelas: true },
        },
        guruPembimbing: {
          select: { id: true, namalengkap: true, email: true, jurusan: true },
        },
      },
    });

    return {
      message: `Keputusan jurnal berhasil diperbarui menjadi ${dto.status}`,
      data: updated,
    };
  }

  async nilaiSiswaBimbingan(guruId: number, siswaId: number, dto: NilaiPklDto) {
    const pengajuan = await this.prisma.pengajuanMagang.findFirst({
      where: {
        siswaId,
        guruPembimbingId: guruId,
      },
    });

    if (!pengajuan) {
      throw new UnauthorizedException('Siswa ini bukan bimbingan Anda');
    }

    const siswa = await this.prisma.siswa.findUnique({
      where: { id: siswaId },
    });

    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const penilaian = await tx.penilaianPkl.upsert({
        where: { siswaId },
        update: {
          guruId,
          nilai: dto.nilai,
          catatan: dto.catatan,
        },
        create: {
          siswaId,
          guruId,
          nilai: dto.nilai,
          catatan: dto.catatan,
        },
      });

      let statusSiswa = siswa.status;
      if (dto.nilai > 75) {
        statusSiswa = Status.LULUS;
        await tx.siswa.update({
          where: { id: siswaId },
          data: { status: Status.LULUS },
        });
      }

      return {
        penilaian,
        statusSiswa,
      };
    });

    return {
      message:
        dto.nilai > 75
          ? 'Nilai berhasil disimpan dan status siswa otomatis LULUS (nilai > 75)'
          : 'Nilai berhasil disimpan',
      data: result,
    };
  }
}
