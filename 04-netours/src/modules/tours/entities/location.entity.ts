import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tour } from './tour.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'int', nullable: true })
  day: number;

  @Column('geometry', { spatialFeatureType: 'Point', srid: 4326 })
  coordinates: string;

  @ManyToOne(() => Tour, (tour) => tour.locations)
  tour: Tour;
}
