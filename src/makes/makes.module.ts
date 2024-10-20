import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Make } from '../db/entities/make.entity';
import { VehicleType } from '../db/entities/vehicle-type.entity';
import { MakeResolver } from './make.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Make, VehicleType])],
  providers: [MakeResolver],
})
export class MakesModule {}
