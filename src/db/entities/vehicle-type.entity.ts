import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Make } from './make.entity';

@Entity()
export class VehicleType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vehicleTypeId: number;

  @Column()
  vehicleTypeName: string;

  @ManyToMany(() => Make, (make) => make.vehicleTypes)
  makes: Make[];
}
