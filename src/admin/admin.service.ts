import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Jurusan, Prisma, Role, Status, StatusAbsen } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuruDto } from './dto/create-guru.dto';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { CreateDudiDto } from './dto/create-dudi.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { UpdateStatusGuruDto } from './dto/update-status-guru.dto';
import { UpdateStatusSiswaDto } from './dto/update-status-siswa.dto';
import { FilterGuruDto } from './dto/filter-guru.dto';
import { UpdateDudiDto } from './dto/update-dudi.dto';
import { KeputusanPengajuan } from './dto/update-status-pengajuan.dto';
import { FilterPenempatanDto } from './dto/filter-penempatan.dto';
import { UpdatePenempatanDto } from './dto/update-penempatan.dto';

const DEFAULT_REGISTER_PASSWORD = 'password123';
const SCHOOL_EMAIL_DOMAIN = '@simmas.sch.id';

function createSchoolEmail(name: string): string {
  return `${name.trim().toLowerCase().replace(/\s+/g, '')}${SCHOOL_EMAIL_DOMAIN}`;
}

function uniqueConstraintIncludes(
  error: Prisma.PrismaClientKnownRequestError,
  field: string,
): boolean {
  const target = error.meta?.target;
  return Array.isArray(target)
    ? target.includes(field)
    : typeof target === 'string' && target.includes(field);
}

export interface RegisterResponseDto<T> {
  message: string;
  data: T;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonitoringSiswa(kelas?: string) {
    const siswaList = await this.prisma.siswa.findMany({
      where: kelas ? { kelas } : undefined,
      include: {
        pengajuan: {
          include: {
            dudi: true,
            guruPembimbing: true,
          },
        },
        absen: true,
        jurnal: true,
      },
      orderBy: { nama: 'asc' },
    });

    const result = siswaList.map((s) => {
      // Ambil pengajuan yang disetujui (tempat magang dan pembimbing aktif)
      const penempatanAktif = s.pengajuan.find((p) => p.status === Status.DISETUJUI) || s.pengajuan[0];

      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpha = 0;

      for (const a of s.absen) {
        if (a.statusAbsen === StatusAbsen.HADIR) hadir++;
        else if (a.statusAbsen === StatusAbsen.SAKIT) sakit++;
        else if (a.statusAbsen === StatusAbsen.IZIN) izin++;
        else if (a.statusAbsen === StatusAbsen.ALPHA) alpha++;
      }

      let currentStatus = s.status;
      if (alpha >= 3) {
        currentStatus = Status.BERMASALAH;
      } else if (alpha === 2) {
        currentStatus = Status.PERLU_PERHATIAN;
      }

      return {
        id: s.id,
        nama: s.nama,
        nis: s.nis,
        kelas: s.kelas,
        status: currentStatus,
        dudi: penempatanAktif?.dudi ? penempatanAktif.dudi.nama_perusahaan : '-',
        pembimbing: penempatanAktif?.guruPembimbing ? penempatanAktif.guruPembimbing.namalengkap : '-',
        kehadiran: {
          hadir,
          sakit,
          izin,
          alpha,
          format: `H:${hadir}, S:${sakit}, I:${izin}, A:${alpha}`,
        },
        jumlah_jurnal: s.jurnal.length,
      };
    });

    return {
      message: 'Berhasil memuat data monitoring siswa',
      data: result,
    };
  }

  async getMonitoringKunjungan() {
    const kunjunganList = await this.prisma.kunjunganGuru.findMany({
      include: {
        guru: {
          select: { id: true, namalengkap: true, nip: true, jurusan: true },
        },
        dudi: true,
      },
      orderBy: { tanggalKunjungan: 'desc' },
    });

    const result = kunjunganList.map((k) => ({
      id: k.id,
      tanggal: k.tanggalKunjungan,
      guru_pembimbing: k.guru ? k.guru.namalengkap : '-',
      tempat_magang: k.dudi ? k.dudi.nama_perusahaan : '-',
      catatan_kunjungan: k.catatanEvaluasi,
      fotoUrl: k.fotoUrl,
    }));

    return {
      message: 'Berhasil memuat data monitoring kunjungan guru',
      data: result,
    };
  }

  async registerGuru(dto: CreateGuruDto): Promise<
    RegisterResponseDto<{
      id: number;
      namalengkap: string;
      email: string;
      nip: string;
      jurusan: Jurusan;
      role: Role;
      status: Status;
      createdAt: Date;
    }>
  > {
    try {
      const email = createSchoolEmail(dto.namalengkap);
      const guru = await this.prisma.guru.create({
        data: {
          namalengkap: dto.namalengkap,
          email,
          nip: dto.nip,
          jurusan: dto.jurusan,
          password: await bcrypt.hash(DEFAULT_REGISTER_PASSWORD, 10),
          role: Role.GURU,
          status: Status.NONAKTIF,
        },
        select: {
          id: true,
          namalengkap: true,
          email: true,
          nip: true,
          jurusan: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      return { message: 'Guru berhasil didaftarkan', data: guru };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        if (uniqueConstraintIncludes(error, 'email')) {
          throw new ConflictException(
            'Email otomatis untuk nama guru tersebut sudah terdaftar',
          );
        }
        if (uniqueConstraintIncludes(error, 'nip')) {
          throw new ConflictException('NIP sudah terdaftar');
        }
        throw new ConflictException('Data guru sudah terdaftar');
      }

      throw error;
    }
  }

  async registerSiswa(dto: CreateSiswaDto): Promise<
    RegisterResponseDto<{
      id: number;
      nama: string;
      email: string;
      nis: string;
      kelas: string;
      role: Role;
      status: Status;
      createdAt: Date;
    }>
  > {
    try {
      const email = createSchoolEmail(dto.nama);
      const siswa = await this.prisma.siswa.create({
        data: {
          nama: dto.nama,
          email,
          nis: dto.nis,
          kelas: dto.kelas,
          password: await bcrypt.hash(DEFAULT_REGISTER_PASSWORD, 10),
          role: Role.SISWA,
          status: Status.BELUM_MAGANG,
        },
        select: {
          id: true,
          nama: true,
          email: true,
          nis: true,
          kelas: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      return { message: 'Siswa berhasil didaftarkan', data: siswa };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        if (uniqueConstraintIncludes(error, 'email')) {
          throw new ConflictException(
            'Email otomatis untuk nama siswa tersebut sudah terdaftar',
          );
        }
        if (uniqueConstraintIncludes(error, 'nis')) {
          throw new ConflictException('NIS sudah terdaftar');
        }
        throw new ConflictException('Data siswa sudah terdaftar');
      }

      throw error;
    }
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

  async findAllAdmin(status?: Status) {
    return this.prisma.mitra.findMany({
      where: status ? { status } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateDudi(id: number, dto: UpdateDudiDto) {
    const dudi = await this.prisma.mitra.findUnique({ where: { id } });
    if (!dudi) throw new NotFoundException('Perusahaan tidak ditemukan');

    const updated = await this.prisma.mitra.update({
      where: { id },
      data: {
        ...(dto.nama_perusahaan && { nama_perusahaan: dto.nama_perusahaan }),
        ...(dto.alamat && { alamat: dto.alamat }),
        ...(dto.bidang_usaha && { bidang_usaha: dto.bidang_usaha }),
        ...(dto.kuota_peserta !== undefined && { kuota_peserta: dto.kuota_peserta }),
        ...(dto.penanggung_jawab && { penanggung_jawab: dto.penanggung_jawab }),
        ...(dto.kontak && { kontak: dto.kontak }),
      },
    });

    return { message: 'Data perusahaan berhasil diperbarui', data: updated };
  }

  async deleteDudi(id: number) {
    const dudi = await this.prisma.mitra.findUnique({ where: { id } });
    if (!dudi) throw new NotFoundException('Perusahaan tidak ditemukan');

    await this.prisma.mitra.delete({ where: { id } });
    return { message: 'Data perusahaan berhasil dihapus' };
  }

  async findAllGuru(filter: FilterGuruDto) {
    return this.prisma.guru.findMany({
      where: {
        ...(filter.jurusan && { jurusan: filter.jurusan }),
        ...(filter.status && { status: filter.status }),
      },
      select: {
        id: true,
        namalengkap: true,
        nip: true,
        jurusan: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllSiswa(filter: { kelas?: string; dudiId?: string | number; status?: Status }) {
    const dudiIdNum = filter.dudiId ? Number(filter.dudiId) : undefined;
    
    return this.prisma.siswa.findMany({
      where: {
        ...(filter.kelas && { kelas: filter.kelas }),
        ...(filter.status && { status: filter.status }),
        ...(dudiIdNum && {
          pengajuan: {
            some: {
              dudiId: dudiIdNum,
              status: Status.DISETUJUI,
            },
          },
        }),
      },
      include: {
        pengajuan: {
          include: {
            dudi: true,
            guruPembimbing: {
              select: {
                id: true,
                namalengkap: true,
                nip: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPenempatan(filter: FilterPenempatanDto) {
    return this.prisma.pengajuanMagang.findMany({
      where: {
        status: Status.DISETUJUI,
        dudiId: filter.dudiId,
        siswa: {
          kelas: filter.kelas,
          status: filter.status ?? { in: [Status.SEDANG_MAGANG, Status.LULUS] },
        },
      },
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
        guruPembimbing: {
          select: {
            id: true,
            namalengkap: true,
            email: true,
            nip: true,
            jurusan: true,
            status: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updatePenempatan(siswaId: number, dto: UpdatePenempatanDto) {
    if (
      dto.dudiId === undefined &&
      dto.guruPembimbingId === undefined &&
      dto.posisi === undefined
    ) {
      throw new BadRequestException('Isi perusahaan, guru pembimbing, atau posisi baru');
    }

    const siswa = await this.prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { id: true, status: true },
    });
    if (!siswa) throw new NotFoundException('Siswa tidak ditemukan');

    const penempatan = await this.prisma.pengajuanMagang.findFirst({
      where: { siswaId, status: Status.DISETUJUI },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    });

    if (!penempatan) {
      if (dto.dudiId === undefined || dto.guruPembimbingId === undefined) {
        throw new BadRequestException(
          'Untuk plotting pertama, dudiId dan guruPembimbingId wajib diisi',
        );
      }
      if (siswa.status !== Status.BELUM_MAGANG) {
        throw new BadRequestException(
          'Plotting pertama hanya dapat dilakukan untuk siswa berstatus BELUM_MAGANG',
        );
      }

      const pengajuanMenunggu = await this.prisma.pengajuanMagang.findFirst({
        where: {
          siswaId,
          status: { in: [Status.AJUKAN, Status.DITINJAU_SEKOLAH] },
        },
        select: { id: true },
      });
      if (pengajuanMenunggu) {
        throw new BadRequestException(
          'Siswa masih memiliki pengajuan yang menunggu keputusan',
        );
      }
    }

    if (dto.dudiId !== undefined) {
      const dudi = await this.prisma.mitra.findUnique({
        where: { id: dto.dudiId },
        select: { id: true, status: true },
      });
      if (!dudi) throw new NotFoundException('Perusahaan tidak ditemukan');
      if (dudi.status !== Status.TERVERIFIKASI) {
        throw new BadRequestException('Perusahaan harus terverifikasi');
      }
    }

    if (dto.guruPembimbingId !== undefined) {
      const guru = await this.prisma.guru.findUnique({
        where: { id: dto.guruPembimbingId },
        select: { id: true, status: true },
      });
      if (!guru) throw new NotFoundException('Guru pembimbing tidak ditemukan');
      if (guru.status !== Status.AKTIF) {
        throw new BadRequestException('Guru pembimbing harus berstatus AKTIF');
      }
    }

    const data = await this.prisma.$transaction(async (tx) => {
      let penempatanId = penempatan?.id;
      if (penempatanId !== undefined) {
        await tx.pengajuanMagang.update({
          where: { id: penempatanId },
          data: {
            ...(dto.dudiId !== undefined && { dudiId: dto.dudiId }),
            ...(dto.guruPembimbingId !== undefined && {
              guruPembimbingId: dto.guruPembimbingId,
            }),
            ...(dto.posisi !== undefined && { posisi: dto.posisi.trim() }),
          },
        });
      } else {
        const created = await tx.pengajuanMagang.create({
          data: {
            siswaId,
            dudiId: dto.dudiId!,
            guruPembimbingId: dto.guruPembimbingId!,
            posisi: dto.posisi?.trim() || 'Peserta magang',
            status: Status.DISETUJUI,
          },
        });
        penempatanId = created.id;
        await tx.siswa.update({
          where: { id: siswaId },
          data: { status: Status.SEDANG_MAGANG },
        });
      }

      return tx.pengajuanMagang.findUniqueOrThrow({
        where: { id: penempatanId },
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
          guruPembimbing: {
            select: {
              id: true,
              namalengkap: true,
              email: true,
              nip: true,
              jurusan: true,
              status: true,
            },
          },
        },
      });
    });

    return {
      message: penempatan
        ? 'Penempatan siswa berhasil diperbarui'
        : 'Siswa berhasil diplotting ke perusahaan dan guru pembimbing',
      data,
    };
  }

  async updateStatusPenempatan(siswaId: number, status: Status) {
    const siswa = await this.prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { id: true, status: true },
    });
    if (!siswa) throw new NotFoundException('Siswa tidak ditemukan');

    if (siswa.status === Status.LULUS) {
      throw new BadRequestException(
        'Status LULUS terkunci di endpoint penempatan; ubah melalui /admin/siswa/:id/status',
      );
    }

    if (
      siswa.status !== Status.SEDANG_MAGANG &&
      !(status === Status.SEDANG_MAGANG && siswa.status === Status.BELUM_MAGANG)
    ) {
      throw new BadRequestException(
        'Status hanya dapat diubah menjadi LULUS dari SEDANG_MAGANG',
      );
    }

    const penempatan = await this.prisma.pengajuanMagang.findFirst({
      where: { siswaId, status: Status.DISETUJUI },
      select: { id: true },
    });
    if (!penempatan) {
      throw new NotFoundException('Penempatan siswa tidak ditemukan');
    }

    const allowedCurrentStatuses =
      status === Status.LULUS
        ? [Status.SEDANG_MAGANG]
        : [Status.BELUM_MAGANG, Status.SEDANG_MAGANG];

    const updated = await this.prisma.siswa.updateMany({
      where: { id: siswaId, status: { in: allowedCurrentStatuses } },
      data: { status },
    });

    if (updated.count === 0) {
      throw new BadRequestException(
        'Status siswa sudah berubah; periksa kembali penempatannya',
      );
    }

    const data = await this.prisma.siswa.findUniqueOrThrow({
      where: { id: siswaId },
      select: {
        id: true,
        nama: true,
        nis: true,
        kelas: true,
        status: true,
        updatedAt: true,
      },
    });

    return { message: 'Status penempatan siswa berhasil diperbarui', data };
  }

  async deletePenempatan(siswaId: number) {
    return this.prisma.$transaction(async (tx) => {
      const siswa = await tx.siswa.findUnique({
        where: { id: siswaId },
        select: { id: true, nama: true, status: true },
      });
      if (!siswa) throw new NotFoundException('Siswa tidak ditemukan');

      const penempatan = await tx.pengajuanMagang.findFirst({
        where: { siswaId, status: Status.DISETUJUI },
        select: { id: true },
      });
      if (!penempatan) {
        throw new NotFoundException('Penempatan siswa tidak ditemukan');
      }

      await tx.pengajuanMagang.deleteMany({
        where: { siswaId, status: Status.DISETUJUI },
      });

      const updatedSiswa = await tx.siswa.update({
        where: { id: siswaId },
        data: { status: Status.BELUM_MAGANG },
        select: {
          id: true,
          nama: true,
          nis: true,
          kelas: true,
          status: true,
        },
      });

      return {
        message: 'Penempatan siswa berhasil dihapus dan status dikembalikan',
        data: updatedSiswa,
      };
    });
  }

  async updateGuru(id: number, dto: UpdateGuruDto) {
    const guru = await this.prisma.guru.findUnique({ where: { id } });
    if (!guru) throw new NotFoundException('Guru tidak ditemukan');

    try {
      const updated = await this.prisma.guru.update({
        where: { id },
        data: {
          ...(dto.namalengkap && { namalengkap: dto.namalengkap }),
          ...(dto.nip && { nip: dto.nip }),
          ...(dto.jurusan && { jurusan: dto.jurusan }),
        },
        select: {
          id: true,
          namalengkap: true,
          nip: true,
          jurusan: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
      return { message: 'Data guru berhasil diperbarui', data: updated };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('NIP sudah terdaftar');
      }
      throw error;
    }
  }

  async deleteGuru(id: number) {
    const guru = await this.prisma.guru.findUnique({ where: { id } });
    if (!guru) throw new NotFoundException('Guru tidak ditemukan');

    await this.prisma.guru.delete({ where: { id } });
    return { message: 'Data guru berhasil dihapus' };
  }

  async updateSiswa(id: number, dto: UpdateSiswaDto) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id } });
    if (!siswa) throw new NotFoundException('Siswa tidak ditemukan');

    try {
      const updated = await this.prisma.siswa.update({
        where: { id },
        data: {
          ...(dto.namalengkap !== undefined && { nama: dto.namalengkap }),
          ...(dto.nis !== undefined && { nis: dto.nis }),
          ...(dto.kelas !== undefined && { kelas: dto.kelas }),
        },
        select: {
          id: true,
          nama: true,
          nis: true,
          kelas: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
      return { message: 'Data siswa berhasil diperbarui', data: updated };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('NIS sudah terdaftar');
      }
      throw error;
    }
  }

  async deleteSiswa(id: number) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id } });
    if (!siswa) throw new NotFoundException('Siswa tidak ditemukan');

    await this.prisma.siswa.delete({ where: { id } });
    return { message: 'Data siswa berhasil dihapus' };
  }

  async changePassword(
    adminId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: adminId } });

    if (!user) {
      throw new NotFoundException('Akun admin tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password saat ini salah');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: adminId },
      data: { password: hashed },
    });

    return { message: 'Password berhasil diubah' };
  }

  async updateStatusGuru(id: number, dto: UpdateStatusGuruDto) {
    const guru = await this.prisma.guru.findUnique({ where: { id } });
    if (!guru) throw new NotFoundException('Guru tidak ditemukan');

    const updated = await this.prisma.guru.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        namalengkap: true,
        nip: true,
        jurusan: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return { message: 'Status guru berhasil diperbarui', data: updated };
  }

  async updateStatusSiswa(id: number, dto: UpdateStatusSiswaDto) {
    const siswa = await this.prisma.siswa.findUnique({ where: { id } });
    if (!siswa) throw new NotFoundException('Siswa tidak ditemukan');

    const updated = await this.prisma.siswa.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        nama: true,
        nis: true,
        kelas: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return { message: 'Status siswa berhasil diperbarui', data: updated };
  }

  async approve(id: number) {
    const dudi = await this.prisma.mitra.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!dudi) {
      throw new NotFoundException('Perusahaan tidak ditemukan');
    }

    if (dudi.status === Status.TERVERIFIKASI) {
      throw new BadRequestException('Perusahaan sudah terverifikasi');
    }

    const updatedDudi = await this.prisma.mitra.update({
      where: { id },
      data: { status: Status.TERVERIFIKASI },
    });

    return {
      message: 'Perusahaan berhasil diverifikasi',
      data: updatedDudi,
    };
  }

  async findPengajuanMagangMenungguKeputusan() {
    return this.prisma.pengajuanMagang.findMany({
      where: {
        status: {
          in: [Status.AJUKAN, Status.DITINJAU_SEKOLAH],
        },
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
        dudi: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatusPengajuanMagang(
    pengajuanId: number,
    keputusan: KeputusanPengajuan,
    guruPembimbingId?: number,
  ) {
    const pengajuan = await this.prisma.pengajuanMagang.findUnique({
      where: { id: pengajuanId },
    });

    if (!pengajuan) {
      throw new NotFoundException('Pengajuan magang tidak ditemukan');
    }

    if (
      pengajuan.status !== Status.AJUKAN &&
      pengajuan.status !== Status.DITINJAU_SEKOLAH
    ) {
      throw new BadRequestException('Pengajuan magang sudah diputuskan sebelumnya');
    }

    if (keputusan === KeputusanPengajuan.DISETUJUI) {
      if (guruPembimbingId == null) {
        throw new BadRequestException(
          'Pilih satu guru pembimbing untuk menyetujui pengajuan',
        );
      }

      const guruAktif = await this.prisma.guru.findFirst({
        where: {
          id: guruPembimbingId,
          status: Status.AKTIF,
        },
        select: { id: true },
      });

      if (!guruAktif) {
        throw new BadRequestException(
          'Guru tidak ditemukan atau tidak aktif',
        );
      }
    } else if (guruPembimbingId !== undefined) {
      throw new BadRequestException(
        'Guru pembimbing hanya dapat dipilih saat pengajuan disetujui',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.pengajuanMagang.update({
        where: { id: pengajuanId },
        data: {
          status: keputusan,
          ...(keputusan === KeputusanPengajuan.DISETUJUI && {
            guruPembimbingId,
          }),
        },
      });

      if (keputusan === KeputusanPengajuan.DISETUJUI) {
        await tx.siswa.update({
          where: { id: pengajuan.siswaId },
          data: { status: Status.SEDANG_MAGANG },
        });
      }

      return tx.pengajuanMagang.findUniqueOrThrow({
        where: { id: pengajuanId },
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
          guruPembimbing: {
            select: {
              id: true,
              namalengkap: true,
              email: true,
              nip: true,
              jurusan: true,
              status: true,
            },
          },
        },
      });
    });

    return {
      message:
        keputusan === KeputusanPengajuan.DISETUJUI
          ? 'Pengajuan magang berhasil disetujui'
          : 'Pengajuan magang berhasil ditolak',
      data: updated,
    };
  }
}
