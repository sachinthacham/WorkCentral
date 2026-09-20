import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { SprintsModule } from './modules/sprints/sprints.module';
import { SearchModule } from './modules/search/search.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [

    // Global rate limit: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60_000,
      limit: 100,
    }]),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig]
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongoUri'),
        connectionFactory: (connection) => {
          console.log("✅ MongoDB Connected")
          return connection
        }
      })
    }),

    AuthModule,
    UsersModule,
    WorkspaceModule,
    ProjectsModule,
    TasksModule,
    DashboardModule,
    NotificationsModule,
    EmailModule,
    SprintsModule,
    SearchModule,
    HealthModule,
  ],

  providers: [
    // Applies ThrottlerGuard to every route across the entire app
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],

})
export class AppModule {}