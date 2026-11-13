import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) {
  loadEnvFile();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // GLOBAL PREFIX DULU
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription('Backend API Berjalan')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Admin')
    .addTag('Siswa')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // GUNAKAN docs AGAR TIDAK BENTROK
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3003);
}
void bootstrap();
