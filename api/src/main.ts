import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure upload directories exist before the app starts accepting requests
  const uploadsDir = join(process.cwd(), 'uploads', 'attachments');
  fs.mkdirSync(uploadsDir, { recursive: true });

  // Security headers — applied before static assets so headers are set on file responses too
  app.use(helmet({
    // Relax CSP cross-origin policy to allow the frontend to fetch uploaded files
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // Serve uploaded files at /uploads/* (e.g. /uploads/attachments/file-123.pdf)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
