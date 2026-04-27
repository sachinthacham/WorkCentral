import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Task } from '../tasks/schemas/task.schema'
import { Project } from '../projects/schemas/project.schema'
import { TaskComment } from '../tasks/schemas/task-comment.schema'
import { WorkspaceMember } from '../workspace/schemas/workspace-member.schema'

@Injectable()
export class SearchService {

  constructor(
    @InjectModel(Task.name)         private taskModel: Model<Task>,
    @InjectModel(Project.name)      private projectModel: Model<Project>,
    @InjectModel(TaskComment.name)  private commentModel: Model<TaskComment>,
    @InjectModel(WorkspaceMember.name) private memberModel: Model<WorkspaceMember>,
  ) {}

  async search(
    query: string,
    workspaceId: string,
    type: string | undefined,
    limit: number,
  ) {
    const wsObjId = new Types.ObjectId(workspaceId)

    const runTasks    = !type || type === 'tasks'
    const runProjects = !type || type === 'projects'
    const runComments = !type || type === 'comments'
    const runMembers  = !type || type === 'members'

    const [tasks, projects, comments, members] = await Promise.all([
      runTasks    ? this.searchTasks(query, wsObjId, limit)    : Promise.resolve([]),
      runProjects ? this.searchProjects(query, wsObjId, limit) : Promise.resolve([]),
      runComments ? this.searchComments(query, wsObjId, limit) : Promise.resolve([]),
      runMembers  ? this.searchMembers(query, wsObjId, limit)  : Promise.resolve([]),
    ])

    return {
      query,
      results: {
        tasks:    { data: tasks,    total: tasks.length },
        projects: { data: projects, total: projects.length },
        comments: { data: comments, total: comments.length },
        members:  { data: members,  total: members.length },
      },
    }
  }

  // ─── Tasks ──────────────────────────────────────────────────────────────────
  // Uses MongoDB text index on title (weight 3) + description (weight 1)
  // Results sorted by relevance score descending

  private async searchTasks(query: string, workspaceId: Types.ObjectId, limit: number) {
    return this.taskModel
      .find(
        { $text: { $search: query }, workspaceId, parentTaskId: null },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .select('title description status priority assignee projectId dueDate labels')
      .lean()
  }

  // ─── Projects ───────────────────────────────────────────────────────────────

  private async searchProjects(query: string, workspaceId: Types.ObjectId, limit: number) {
    return this.projectModel
      .find(
        { $text: { $search: query }, workspaceId },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .select('name description createdBy')
      .lean()
  }

  // ─── Comments ───────────────────────────────────────────────────────────────
  // TaskComment has no workspaceId, so we $lookup the parent Task to scope by workspace

  private async searchComments(query: string, workspaceId: Types.ObjectId, limit: number) {
    return this.commentModel.aggregate([
      { $match: { $text: { $search: query } } },
      { $addFields: { score: { $meta: 'textScore' } } },
      { $sort: { score: -1 } },
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'task',
        },
      },
      { $unwind: '$task' },
      { $match: { 'task.workspaceId': workspaceId } },
      { $limit: limit },
      {
        $project: {
          content: 1,
          userId: 1,
          taskId: 1,
          score: 1,
          'task.title': 1,
          'task.projectId': 1,
          createdAt: 1,
        },
      },
    ])
  }

  // ─── Members ────────────────────────────────────────────────────────────────
  // Searched with $regex (case-insensitive) since user fields live on a separate
  // collection and $text across $lookup is not natively supported in MongoDB

  private async searchMembers(query: string, workspaceId: Types.ObjectId, limit: number) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(escaped, 'i')

    return this.memberModel.aggregate([
      { $match: { workspaceId } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $match: {
          $or: [
            { 'user.name': { $regex: pattern } },
            { 'user.email': { $regex: pattern } },
          ],
        },
      },
      { $limit: limit },
      {
        $project: {
          userId: '$user._id',
          name: '$user.name',
          email: '$user.email',
          role: 1,
        },
      },
    ])
  }
}
