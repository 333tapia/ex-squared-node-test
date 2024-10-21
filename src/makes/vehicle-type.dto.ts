import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VehicleTypeDto {
  @Field()
  typeId: number;

  @Field()
  typeName: string;
}
