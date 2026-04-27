import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SprintsController } from './sprints.controller';
import { SprintsService } from './sprints.service';
import { Sprint, SprintSchema } from './schemas/sprint.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sprint.name, schema: SprintSchema }]),
  ],
  controllers: [SprintsController],
  providers: [SprintsService]
})
export class SprintsModule {}
