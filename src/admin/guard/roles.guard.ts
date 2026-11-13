import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface UserPayload {
  role?: string;
}

interface RequestWithUser extends Request {
  user?: UserPayload;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ambil role dari decorator
    const roles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // kalau endpoint tidak punya role
    if (!roles) {
      return true;
    }

    // ambil request
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser>();

    // ambil user dari jwt
    const user = request.user;

    // kalau user tidak ada
    if (!user) {
      throw new ForbiddenException(
        'User tidak ditemukan',
      );
    }

    // cek role
    const hasRole = roles.includes(user.role ?? '');

    // kalau bukan role yang diizinkan
    if (!hasRole) {
      throw new ForbiddenException(
        'Kamu tidak punya akses',
      );
    }

    return true;
  }
}