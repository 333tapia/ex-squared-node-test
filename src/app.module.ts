import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from './db/db.module';
import { Make } from './db/entities/make.entity';
import { VehicleType } from './db/entities/vehicle-type.entity';
import { MakesModule } from './makes/makes.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req, res }) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Apollo-Operation-Name', 'getAllMakes');
        res.setHeader('apollo-require-preflight', true);
        return { req, res };
      },
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
