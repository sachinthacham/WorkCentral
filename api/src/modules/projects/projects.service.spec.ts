import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { Project } from './schemas/project.schema'
import { ProjectMember } from './schemas/project-member.schema'

describe('ProjectsService', () => {
  let service: ProjectsService
  let projectModel: {
    create: jest.Mock
    findById: jest.Mock
    find: jest.Mock
    countDocuments: jest.Mock
  }
  let projectMemberModel: {
    create: jest.Mock
    find: jest.Mock
    findOne: jest.Mock
    findOneAndUpdate: jest.Mock
    findOneAndDelete: jest.Mock
    countDocuments: jest.Mock
  }

  const projectId = '507f1f77bcf86cd799439011'
  const userId = '507f1f77bcf86cd799439012'

  beforeEach(async () => {
    projectModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    }
    projectMemberModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getModelToken(Project.name), useValue: projectModel },
        { provide: getModelToken(ProjectMember.name), useValue: projectMemberModel },
      ],
    }).compile()

    service = module.get(ProjectsService)
  })

  describe('addMember', () => {
    it('throws NotFoundException when project does not exist', async () => {
      projectModel.findById.mockResolvedValue(null)
      await expect(
        service.addMember(projectId, userId, 'MEMBER'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('throws ConflictException when user is already a member', async () => {
      projectModel.findById.mockResolvedValue({ _id: projectId })
      const dup = Object.assign(new Error('duplicate'), { code: 11000 })
      projectMemberModel.create.mockRejectedValue(dup)

      await expect(
        service.addMember(projectId, userId, 'MEMBER'),
      ).rejects.toBeInstanceOf(ConflictException)
    })
  })

  describe('removeMember', () => {
    it('throws ForbiddenException when user tries to remove themselves', async () => {
      await expect(
        service.removeMember(projectId, userId, userId),
      ).rejects.toBeInstanceOf(ForbiddenException)
      expect(projectMemberModel.findOneAndDelete).not.toHaveBeenCalled()
    })
  })

  describe('getUserRole', () => {
    it('returns null when user has no membership', async () => {
      projectMemberModel.findOne.mockResolvedValue(null)
      const role = await service.getUserRole(projectId, userId)
      expect(role).toBeNull()
    })

    it('returns role when member exists', async () => {
      projectMemberModel.findOne.mockResolvedValue({ role: 'MANAGER' })
      const role = await service.getUserRole(projectId, userId)
      expect(role).toBe('MANAGER')
    })
  })
})
