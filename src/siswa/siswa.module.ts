import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SiswaController } from './siswa.controller';
import { SiswaService } from './siswa.service';
import { JwtStrategy } from '../admin/strategies/jwt.strategy';
import { RolesGuard } from '../admin/guard/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../common/cloudinary.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SiswaController],
  providers: [SiswaService, JwtStrategy, RolesGuard],
  exports: [SiswaService],
})
export class SiswaModule {}
