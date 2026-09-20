import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Unauthenticated liveness probe.
 *
 * The App Service Free (F1) tier has no "Always On", so the container is
 * unloaded after ~20 minutes idle. A scheduled pinger hits /health to keep the
 * app warm; throttling is skipped so those pings never eat the rate-limit budget.
 */
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    // mongoose readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
    const dbConnected = this.connection.readyState === 1;
    return {
      status: dbConnected ? 'ok' : 'degraded',
      database: dbConnected ? 'connected' : 'disconnected',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
