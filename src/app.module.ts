import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from './db/db.module';
import { Make } from './db/entities/make.entity';
import { VehicleType } from './db/entities/vehicle-type.entity';
import { MakeResolver } from './makes/make.resolver';
import { MakesModule } from './makes/makes.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Make, VehicleType],
      synchronize: true,
    }),
    DbModule,
    MakesModule,
  ],
})
export class AppModule {}
