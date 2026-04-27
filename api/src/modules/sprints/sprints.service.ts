import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sprint } from './schemas/sprint.schema';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { paginatedResult } from '../../common/helpers/paginated-result.helper';

@Injectable()
export class SprintsService {
  constructor(@InjectModel(Sprint.name) private sprintModel: Model<Sprint>) {}

  async create(dto: CreateSprintDto) {
    return this.sprintModel.create({
      name: dto.name,
      projectId: dto.projectId,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: 'PLANNED',
    });
  }

  async findAllForProject(projectId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const query = { projectId };
    const [data, total] = await Promise.all([
      this.sprintModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.sprintModel.countDocuments(query),
    ]);
    return paginatedResult(data, total, page, limit);
  }

  async updateStatus(sprintId: string, status: string) {
    return this.sprintModel.findByIdAndUpdate(
      sprintId,
      { status },
      { new: true }
    );
  }
}
