import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { VehicleType } from './vehicle-type.entity';

@Entity()
export class Make {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  makeId: number;

  @Column()
  makeName: string;

  @ManyToMany(() => VehicleType, (vehicleType) => vehicleType.makes)
  @JoinTable()
  vehicleTypes: VehicleType[];
}
