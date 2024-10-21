import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Make } from '../db/entities/make.entity';
import { VehicleType } from '../db/entities/vehicle-type.entity';
import { MakeResolver } from './make.resolver';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Make, VehicleType]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'db-seed',
    }),
  ],

  providers: [MakeResolver],
})
export class MakesModule {}
