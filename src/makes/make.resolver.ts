import { Query, Resolver } from '@nestjs/graphql';
import { MakeDto } from './make.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Make } from '../db/entities/make.entity';

@Resolver(() => MakeDto)
export class MakeResolver {
  constructor(
    @InjectRepository(Make) private readonly makeRepository: Repository<Make>,
  ) {}

  @Query(() => [MakeDto])
  async getAllMakes(): Promise<MakeDto[]> {
    const makes = await this.makeRepository.find({
      relations: ['vehicleTypes'],
    });
    return makes.map((make) => ({
      makeId: make.makeId,
      makeName: make.makeName,
      vehicleTypes: make.vehicleTypes.map((type) => ({
        typeId: type.vehicleTypeId,
        typeName: type.vehicleTypeName,
      })),
    }));
  }
}
