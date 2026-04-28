import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { TasksService } from './tasks.services'
import { Task } from './schemas/task.schema'
import { TaskComment } from './schemas/task-comment.schema'
import { TaskActivity } from './schemas/task-activity.schema'
import { TaskGateway } from './task.gateway'
import { NotificationsService } from '../notifications/notifications.service'

describe('TasksService', () => {
  let service: TasksService
  let taskModel: {
    create: jest.Mock
    find: jest.Mock
    findById: jest.Mock
    findByIdAndUpdate: jest.Mock
    findByIdAndDelete: jest.Mock
    countDocuments: jest.Mock
  }
  let commentModel: { create: jest.Mock; find: jest.Mock; countDocuments: jest.Mock }
  let activityModel: { create: jest.Mock; find: jest.Mock; countDocuments: jest.Mock }
  let taskGateway: { notifyTaskUpdate: jest.Mock }
  let notificationsService: { createNotification: jest.Mock }

  const projectId = '507f1f77bcf86cd799439011'
  const workspaceId = '507f1f77bcf86cd799439012'
  const userId = '507f1f77bcf86cd799439013'
  const parentId = '507f1f77bcf86cd799439014'

  beforeEach(async () => {
    taskModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    }
    commentModel = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    }
    activityModel = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    }
    taskGateway = { notifyTaskUpdate: jest.fn() }
    notificationsService = { createNotification: jest.fn().mockResolvedValue(undefined) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken(Task.name), useValue: taskModel },
        { provide: getModelToken(TaskComment.name), useValue: commentModel },
        { provide: getModelToken(TaskActivity.name), useValue: activityModel },
        { provide: TaskGateway, useValue: taskGateway },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile()

    service = module.get(TasksService)
  })

  describe('createTask', () => {
    const baseDto = { priority: 'medium', labels: [] as string[] }

    it('creates a top-level task', async () => {
      const created = { _id: 't1', title: 'A' }
      taskModel.create.mockResolvedValue(created)

      const out = await service.createTask(
        'A',
        'desc',
        projectId,
        workspaceId,
        userId,
        baseDto as any,
      )

      expect(out).toBe(created)
      expect(taskModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'A',
          description: 'desc',
          parentTaskId: null,
        }),
      )
    })

    it('throws when parent task is missing', async () => {
      taskModel.findById.mockResolvedValue(null)
      await expect(
        service.createTask('A', '', projectId, workspaceId, userId, {
          ...baseDto,
          parentTaskId: parentId,
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException)
      expect(taskModel.create).not.toHaveBeenCalled()
    })

    it('throws when parent belongs to another project', async () => {
      const otherProject = new Types.ObjectId()
      taskModel.findById.mockResolvedValue({
        projectId: otherProject,
        parentTaskId: null,
      })

      await expect(
        service.createTask('A', '', projectId, workspaceId, userId, {
          ...baseDto,
          parentTaskId: parentId,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('throws when parent is already a sub-task', async () => {
      taskModel.findById.mockResolvedValue({
        projectId: new Types.ObjectId(projectId),
        parentTaskId: new Types.ObjectId(),
      })

      await expect(
        service.createTask('A', '', projectId, workspaceId, userId, {
          ...baseDto,
          parentTaskId: parentId,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException)
    })
  })

  describe('getSubTasks', () => {
    it('throws when parent does not exist', async () => {
      taskModel.findById.mockResolvedValue(null)
      await expect(service.getSubTasks(parentId)).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })
  })

  /** Mongoose-like query: await query and await query.select() both work */
  function depQuery(doc: { blockedBy?: Types.ObjectId[]; _id?: Types.ObjectId }) {
    const d = { blockedBy: doc.blockedBy ?? [], ...doc }
    const p = Promise.resolve(d)
    return {
      select() {
        return Promise.resolve({ blockedBy: d.blockedBy })
      },
      then(onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) {
        return p.then(onFulfilled, onRejected)
      },
    }
  }

  describe('addDependency', () => {
    it('rejects self-dependency', async () => {
      await expect(
        service.addDependency(parentId, parentId),
      ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('throws when task is missing', async () => {
      taskModel.findById.mockImplementation((id: unknown) => {
        if (String(id) === parentId) return Promise.resolve(null)
        return depQuery({ blockedBy: [] })
      })
      await expect(
        service.addDependency(parentId, '507f1f77bcf86cd799439099'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('throws when dependency already exists', async () => {
      const blocker = new Types.ObjectId('507f1f77bcf86cd799439020')
      const tid = '507f1f77bcf86cd799439021'
      const bid = '507f1f77bcf86cd799439020'
      taskModel.findById.mockImplementation((id: unknown) => {
        const s = String(id)
        if (s === tid) return depQuery({ blockedBy: [blocker] })
        if (s === bid) return depQuery({ _id: blocker, blockedBy: [] })
        return Promise.resolve(null)
      })

      await expect(service.addDependency(tid, bid)).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })

    it('throws when dependency would create a cycle', async () => {
      const taskId = '507f1f77bcf86cd799439030'
      const blockerId = '507f1f77bcf86cd799439031'
      const taskOid = new Types.ObjectId(taskId)

      taskModel.findById.mockImplementation((id: unknown) => {
        const s = String(id)
        if (s === taskId) return depQuery({ blockedBy: [], _id: taskOid })
        if (s === blockerId) {
          return depQuery({ blockedBy: [taskOid], _id: new Types.ObjectId(blockerId) })
        }
        return depQuery({ blockedBy: [] })
      })

      await expect(service.addDependency(taskId, blockerId)).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })
  })

  describe('assignTask', () => {
    it('creates notification when assignee update succeeds', async () => {
      const assignee = '507f1f77bcf86cd799439040'
      taskModel.findByIdAndUpdate.mockResolvedValue({
        title: 'Do work',
        _id: 't',
      })

      await service.assignTask('507f1f77bcf86cd799439041', assignee)

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        assignee,
        expect.stringContaining('Do work'),
        'task_assigned',
      )
    })
  })

  describe('createComment', () => {
    it('notifies task owner when commenter is not the owner', async () => {
      const taskId = '507f1f77bcf86cd799439050'
      const commenter = '507f1f77bcf86cd799439051'
      const owner = '507f1f77bcf86cd799439052'

      commentModel.create.mockResolvedValue({ _id: 'c1' })
      taskModel.findById.mockResolvedValue({
        title: 'T',
        createdBy: { toString: () => owner },
      })

      await service.createComment(taskId, commenter, 'hi')

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        owner,
        expect.stringContaining('T'),
        'comment_added',
      )
    })

    it('does not notify when user comments on own task', async () => {
      const taskId = '507f1f77bcf86cd799439050'
      const uid = '507f1f77bcf86cd799439052'

      commentModel.create.mockResolvedValue({ _id: 'c1' })
      taskModel.findById.mockResolvedValue({
        title: 'T',
        createdBy: { toString: () => uid },
      })

      await service.createComment(taskId, uid, 'note')

      expect(notificationsService.createNotification).not.toHaveBeenCalled()
    })
  })
})
