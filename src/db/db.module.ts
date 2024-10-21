import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Make } from './entities/make.entity';
import { VehicleType } from './entities/vehicle-type.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Make, VehicleType])],
  providers: [SeedService],
})
export class DbModule {}
