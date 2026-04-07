import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';

@Module({
  imports: [

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
  ],

})
export class AppModule {}