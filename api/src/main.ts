import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as fs from 'fs';
import { getAttachmentsDir, getUploadsRoot } from './common/helpers/uploads-path.helper';

/** Comma-separated allowlist; falls back to local dev. Supports Vercel preview URLs via CORS_ORIGIN_REGEX. */
function resolveCorsOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? 'http://localhost:3001')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadsRoot = getUploadsRoot();
  fs.mkdirSync(getAttachmentsDir(), { recursive: true });

  // Behind the App Service / Vercel reverse proxies, trust X-Forwarded-* so
  // rate limiting sees the real client IP rather than the load balancer's.
  app.set('trust proxy', 1);

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

  const allowedOrigins = resolveCorsOrigins();
  const originRegex = process.env.CORS_ORIGIN_REGEX
    ? new RegExp(process.env.CORS_ORIGIN_REGEX)
    : null;

  app.enableCors({
    origin: (origin, callback) => {
      // Same-origin/server-side calls and health probes arrive without an Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (originRegex?.test(origin)) return callback(null, true);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
  });

  // Serve uploaded files at /uploads/* (e.g. /uploads/attachments/file-123.pdf)
  app.useStaticAssets(uploadsRoot, {
    prefix: '/uploads',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API listening on :${port} — CORS allowlist: ${allowedOrigins.join(', ')}`);
}
bootstrap();
