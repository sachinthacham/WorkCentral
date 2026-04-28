import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { WorkspaceService } from './workspace.service'
import { Workspace } from './schemas/workspace.schema'
import { WorkspaceMember } from './schemas/workspace-member.schema'
import { User } from '../users/schemas/user.schema'
import { EmailService } from '../email/email.service'

describe('WorkspaceService', () => {
  let service: WorkspaceService
  let workspaceModel: { create: jest.Mock; findById: jest.Mock; findByIdAndUpdate: jest.Mock }
  let memberModel: { create: jest.Mock; find: jest.Mock; findOne: jest.Mock; countDocuments: jest.Mock }
  let userModel: { findOne: jest.Mock }
  let emailService: { sendInvitationEmail: jest.Mock }

  const userId = '507f1f77bcf86cd799439011'
  const workspaceId = '507f1f77bcf86cd799439012'

  beforeEach(async () => {
    workspaceModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    }
    memberModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
    }
    userModel = { findOne: jest.fn() }
    emailService = {
      sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: getModelToken(Workspace.name), useValue: workspaceModel },
        { provide: getModelToken(WorkspaceMember.name), useValue: memberModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile()

    service = module.get(WorkspaceService)
  })

  describe('createWorkspace', () => {
    it('creates workspace and seeds caller as OWNER', async () => {
      const ws = { _id: new Types.ObjectId(workspaceId), name: 'Acme' }
      workspaceModel.create.mockResolvedValue(ws)
      memberModel.create.mockResolvedValue({ role: 'OWNER' })

      const out = await service.createWorkspace('Acme', userId)

      expect(out).toBe(ws)
      expect(workspaceModel.create).toHaveBeenCalledWith({
        name: 'Acme',
        owner: userId,
      })
      expect(memberModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: ws._id,
          role: 'OWNER',
        }),
      )
    })
  })

  describe('inviteUser', () => {
    it('throws when user email is not registered', async () => {
      userModel.findOne.mockResolvedValue(null)
      await expect(
        service.inviteUser(workspaceId, 'nope@test.com', 'MEMBER'),
      ).rejects.toThrow('User not found')
    })

    it('throws when user is already a member', async () => {
      userModel.findOne.mockResolvedValue({ _id: new Types.ObjectId(userId) })
      memberModel.findOne.mockResolvedValue({ _id: 'existing' })

      await expect(
        service.inviteUser(workspaceId, 'u@test.com', 'MEMBER'),
      ).rejects.toThrow('User already in workspace')
    })

    it('adds member with uppercased role and sends invitation email', async () => {
      const uid = new Types.ObjectId(userId)
      userModel.findOne.mockResolvedValue({ _id: uid, email: 'u@test.com' })
      memberModel.findOne.mockResolvedValue(null)
      const member = { workspaceId, userId: uid, role: 'MEMBER' }
      memberModel.create.mockResolvedValue(member)
      workspaceModel.findById.mockResolvedValue({ name: 'Acme Org' })

      const out = await service.inviteUser(workspaceId, 'u@test.com', 'member')

      expect(out).toBe(member)
      expect(memberModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'MEMBER',
        }),
      )
      expect(emailService.sendInvitationEmail).toHaveBeenCalledWith(
        'u@test.com',
        'Acme Org',
        'member',
      )
    })
  })

  describe('updateSettings', () => {
    it('merges settings onto workspace', async () => {
      const updated = { _id: workspaceId, settings: { theme: 'dark' } }
      workspaceModel.findByIdAndUpdate.mockResolvedValue(updated)

      const out = await service.updateSettings(workspaceId, { theme: 'dark' })

      expect(out).toEqual(updated)
      expect(workspaceModel.findByIdAndUpdate).toHaveBeenCalledWith(
        workspaceId,
        { $set: { settings: { theme: 'dark' } } },
        { new: true },
      )
    })
  })
})
