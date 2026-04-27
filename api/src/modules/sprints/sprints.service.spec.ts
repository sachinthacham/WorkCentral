import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { SprintsService } from './sprints.service'
import { Sprint } from './schemas/sprint.schema'

describe('SprintsService', () => {
  let service: SprintsService
  let sprintModel: {
    create: jest.Mock
    find: jest.Mock
    countDocuments: jest.Mock
    findByIdAndUpdate: jest.Mock
  }

  beforeEach(async () => {
    sprintModel = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        { provide: getModelToken(Sprint.name), useValue: sprintModel },
      ],
    }).compile()

    service = module.get(SprintsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('persists sprint with PLANNED status', async () => {
      const dto = {
        name: 'Sprint 1',
        projectId: '507f1f77bcf86cd799439011',
        startDate: '2026-01-01',
        endDate: '2026-01-15',
      }
      sprintModel.create.mockResolvedValue({ _id: 's1', ...dto })

      await service.create(dto as any)

      expect(sprintModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sprint 1',
          projectId: dto.projectId,
          status: 'PLANNED',
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      )
    })
  })
})
