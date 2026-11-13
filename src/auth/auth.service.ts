import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

interface LoginCandidate {
  id: number;
  email: string;
  password: string;
  role: Role;
  nama: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const [user, siswa, guru] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.siswa.findUnique({ where: { email: dto.email } }),
      this.prisma.guru.findUnique({ where: { email: dto.email } }),
    ]);

    const candidates: LoginCandidate[] = [
      ...(user && (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN)
        ? [{ id: user.id, email: user.email, password: user.password, role: user.role, nama: user.name }]
        : []),
      ...(siswa
        ? [{ id: siswa.id, email: siswa.email, password: siswa.password, role: Role.SISWA, nama: siswa.nama }]
        : []),
      ...(guru
        ? [{ id: guru.id, email: guru.email, password: guru.password, role: Role.GURU, nama: guru.namalengkap }]
        : []),
    ];

    const matches: LoginCandidate[] = [];
    for (const candidate of candidates) {
      if (await bcrypt.compare(dto.password, candidate.password)) {
        matches.push(candidate);
      }
    }

    if (matches.length !== 1) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const account = matches[0];
    return {
      message: 'Berhasil login',
      access_token: await this.jwtService.signAsync({
        sub: account.id,
        email: account.email,
        role: account.role,
      }),
      user: {
        id: account.id,
        email: account.email,
        nama: account.nama,
        role: account.role,
      },
    };
  }
}
