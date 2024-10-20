import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { SeedService } from './seed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Make } from './entities/make.entity';
import { VehicleType } from './entities/vehicle-type.entity';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';

const mockMakeRepository = {
  save: jest.fn(),
};

const mockVehicleTypeRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockHttpService = {
  get: jest.fn(),
};

describe('SeedService', () => {
  let seedService: SeedService;
  let makeRepository: Repository<Make>;
  let vehicleTypeRepository: Repository<VehicleType>;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(Make),
          useValue: mockMakeRepository,
        },
        {
          provide: getRepositoryToken(VehicleType),
          useValue: mockVehicleTypeRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    seedService = module.get<SeedService>(SeedService);
    makeRepository = module.get(getRepositoryToken(Make));
    vehicleTypeRepository = module.get(getRepositoryToken(VehicleType));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    const makes = [{ makeId: 1, makeName: 'Toyota' }];
    const vehicleTypes = [{ vehicleTypeId: 1, vehicleTypeName: 'SUV' }];
    const vehicleType = new VehicleType();
    vehicleType.vehicleTypeId = vehicleTypes[0].vehicleTypeId;
    vehicleType.vehicleTypeName = vehicleTypes[0].vehicleTypeName;
    const make = new Make();
    make.makeId = 1;
    make.makeName = 'Toyota';
    make.vehicleTypes = [vehicleType];

    it('should seed data successfully', async () => {
      jest.spyOn(seedService, 'getMakes').mockResolvedValueOnce(makes);
      jest
        .spyOn(seedService, 'getVehicleTypesByMakeId')
        .mockResolvedValueOnce(vehicleTypes);
      jest.spyOn(vehicleTypeRepository, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(vehicleTypeRepository, 'save')
        .mockResolvedValueOnce(vehicleType);
      jest.spyOn(makeRepository, 'save').mockResolvedValueOnce(make);

      await seedService.run();

      expect(seedService.getMakes).toHaveBeenCalledTimes(1);
      expect(seedService.getVehicleTypesByMakeId).toHaveBeenCalledTimes(1);
      expect(vehicleTypeRepository.findOne).toHaveBeenCalledTimes(1);
      expect(vehicleTypeRepository.save).toHaveBeenCalledTimes(1);
      expect(makeRepository.save).toHaveBeenCalledTimes(1);
      expect(makeRepository.save).toHaveBeenCalledWith(make);
    });

    it('should not store vehicle type when it is found in DB', async () => {
      jest.spyOn(seedService, 'getMakes').mockResolvedValueOnce(makes);
      jest
        .spyOn(seedService, 'getVehicleTypesByMakeId')
        .mockResolvedValueOnce(vehicleTypes);
      jest
        .spyOn(vehicleTypeRepository, 'findOne')
        .mockResolvedValueOnce(vehicleType);
      jest.spyOn(makeRepository, 'save').mockResolvedValueOnce(make);

      await seedService.run();

      expect(seedService.getMakes).toHaveBeenCalledTimes(1);
      expect(seedService.getVehicleTypesByMakeId).toHaveBeenCalledTimes(1);
      expect(vehicleTypeRepository.findOne).toHaveBeenCalledTimes(1);
      expect(vehicleTypeRepository.save).not.toHaveBeenCalledTimes(1);
      expect(makeRepository.save).toHaveBeenCalledTimes(1);
      expect(makeRepository.save).toHaveBeenCalledWith(make);
    });
  });

  describe('getMakes', () => {
    it('should return makes data', async () => {
      mockHttpService.get.mockReturnValueOnce(
        of({
          data: `<Response><Results><AllVehicleMakes><Make_ID>1</Make_ID><Make_Name>TestMake</Make_Name></AllVehicleMakes></Results></Response>`,
        }),
      );

      const makes = await seedService.getMakes();

      expect(makes).toEqual([{ makeId: '1', makeName: 'TestMake' }]);
    });

    it('should handle error in getMakes', async () => {
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => new Error('HTTP Error')),
      );

      const makes = await seedService.getMakes();

      expect(makes).toBeUndefined();
    });
  });

  describe('getVehicleTypesByMakeId', () => {
    it('should return vehicle types data', async () => {
      mockHttpService.get.mockReturnValueOnce(
        of({
          data: `<Response><Results><VehicleTypesForMakeIds><VehicleTypeId>1</VehicleTypeId><VehicleTypeName>SUV</VehicleTypeName></VehicleTypesForMakeIds></Results></Response>`,
        }),
      );

      const vehicleTypes = await seedService.getVehicleTypesByMakeId(1);

      expect(vehicleTypes).toEqual([
        { vehicleTypeId: '1', vehicleTypeName: 'SUV' },
      ]);
    });

    it('should handle empty vehicle types response', async () => {
      mockHttpService.get.mockReturnValueOnce(
        of({
          data: `<Response><Results></Results></Response>`,
        }),
      );

      const vehicleTypes = await seedService.getVehicleTypesByMakeId(1);

      expect(vehicleTypes).toBeUndefined();
    });

    it('should handle error in getVehicleTypesByMakeId', async () => {
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => new Error('HTTP Error')),
      );

      const vehicleTypes = await seedService.getVehicleTypesByMakeId(1);

      expect(vehicleTypes).toBeUndefined();
    });
  });
});
