import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Make } from './entities/make.entity';
import { parseStringPromise } from 'xml2js';
import { Repository } from 'typeorm';
import { VehicleType } from './entities/vehicle-type.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Make)
    private readonly MakeRepository: Repository<Make>,
    @InjectRepository(VehicleType)
    private readonly VehicleTypeRepository: Repository<VehicleType>,
  ) {}

  async run() {
    const makesData = await this.getMakes();
    for (const makeData of makesData) {
      const make = new Make();
      make.makeId = makeData.makeId;
      make.makeName = makeData.makeName;
      const vehicleTypesData = await this.getVehicleTypesByMakeId(make.makeId);

      const vehicleTypes: VehicleType[] = [];
      if (!vehicleTypesData) {
        make.vehicleTypes = [];
        await this.MakeRepository.save(make);
        continue;
      }
      for (const vehicleTypeData of vehicleTypesData) {
        let vehicleType = await this.VehicleTypeRepository.findOne({
          where: { vehicleTypeId: vehicleTypeData.vehicleTypeId },
        });
        if (!vehicleType) {
          vehicleType = new VehicleType();
          vehicleType.vehicleTypeId = vehicleTypeData.vehicleTypeId;
          vehicleType.vehicleTypeName = vehicleTypeData.vehicleTypeName;
          vehicleType = await this.VehicleTypeRepository.save(vehicleType);
        }
        vehicleTypes.push(vehicleType);
      }
      make.vehicleTypes = vehicleTypes;
      await this.MakeRepository.save(make);
    }
    console.log('Data seeded successfully');
  }

  async getMakes() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=xml',
          { responseType: 'document', timeout: 10000 },
        ),
      );
      const jsonData = await parseStringPromise(response.data);
      const makes = jsonData.Response.Results[0].AllVehicleMakes.map(
        (make) => ({
          makeId: make.Make_ID[0],
          makeName: make.Make_Name[0],
        }),
      );
      return makes;
    } catch (error) {
      console.log('Error fetching Makes data', error);
    }
  }

  async getVehicleTypesByMakeId(makeId: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`,
          { timeout: 10000 },
        ),
      );
      const jsonData = await parseStringPromise(response.data);
      if (!jsonData.Response.Results[0]) {
        return;
      }
      const vehicleTypes =
        jsonData.Response.Results[0].VehicleTypesForMakeIds.map((vehicle) => ({
          vehicleTypeId: vehicle.VehicleTypeId[0],
          vehicleTypeName: vehicle.VehicleTypeName[0],
        }));
      return vehicleTypes;
    } catch (error) {
      console.log('Error fetching Vehicle Types data', error);
    }
  }
}
