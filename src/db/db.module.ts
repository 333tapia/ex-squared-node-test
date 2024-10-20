import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Make } from './entities/make.entity';
import { VehicleType } from './entities/vehicle-type.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Make, VehicleType])],
  providers: [SeedService],
})
export class DbModule {}
