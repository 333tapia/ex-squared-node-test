import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Make } from './entities/make.entity';
import { VehicleType } from './entities/vehicle-type.entity';
import { SeedService } from './seed.service';
import { SeedProcessor } from './seed.processor';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Make, VehicleType])],
  providers: [SeedService, SeedProcessor],
})
export class DbModule {}
