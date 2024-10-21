import { Test, TestingModule } from '@nestjs/testing';
import { MakeResolver } from './make.resolver';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Make } from '../db/entities/make.entity';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';

const mockMakeRepository = {
  find: jest.fn(),
};

const mockSeedQueue = {
  add: jest.fn(),
};

describe('MakeResolver', () => {
  let makeResolver: MakeResolver;
  let makeRepository: Repository<Make>;
  let seedQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakeResolver,
        {
          provide: getRepositoryToken(Make),
          useValue: mockMakeRepository,
        },
        {
          provide: getQueueToken('db-seed'),
          useValue: mockSeedQueue,
        },
      ],
    }).compile();

    makeResolver = module.get<MakeResolver>(MakeResolver);
    makeRepository = module.get<Repository<Make>>(getRepositoryToken(Make));
    seedQueue = module.get<Queue>(getQueueToken('db-seed'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMakes', () => {
    it('should return an array of MakeDto', async () => {
      const mockMakes = [
        {
          makeId: 1,
          makeName: 'Toyota',
          vehicleTypes: [
            { vehicleTypeId: 1, vehicleTypeName: 'Sedan' },
            { vehicleTypeId: 2, vehicleTypeName: 'SUV' },
          ],
        },
        {
          makeId: 2,
          makeName: 'Honda',
          vehicleTypes: [{ vehicleTypeId: 3, vehicleTypeName: 'Coupe' }],
        },
      ];

      mockMakeRepository.find.mockResolvedValue(mockMakes);

      const result = await makeResolver.getAllMakes();

      expect(result).toEqual([
        {
          makeId: 1,
          makeName: 'Toyota',
          vehicleTypes: [
            { typeId: 1, typeName: 'Sedan' },
            { typeId: 2, typeName: 'SUV' },
          ],
        },
        {
          makeId: 2,
          makeName: 'Honda',
          vehicleTypes: [{ typeId: 3, typeName: 'Coupe' }],
        },
      ]);
      expect(makeRepository.find).toHaveBeenCalledWith({
        relations: ['vehicleTypes'],
      });
      expect(seedQueue.add).not.toHaveBeenCalled();
    });

    it('should return an empty array if no makes found', async () => {
      mockMakeRepository.find.mockResolvedValue([]);
      mockSeedQueue.add.mockResolvedValue({});

      const result = await makeResolver.getAllMakes();

      expect(result).toEqual([]);
      expect(makeRepository.find).toHaveBeenCalledWith({
        relations: ['vehicleTypes'],
      });
      expect(seedQueue.add).toHaveBeenCalledWith({});
    });
  });
});
