import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { Difficulty } from '../enums/difficulty.enum';
import { Location } from './location.entity';

@Entity()
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  slug: string;

  @Column()
  duration: number;

  @Column()
  maxGroupSize: number;

  @Column({ type: 'enum', enum: Difficulty })
  difficulty: Difficulty;

  @Column({ type: 'float', default: 4.5 })
  ratingsAverage: number;

  @Column({ type: 'int', default: 0 })
  ratingsQuantity: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float', nullable: true })
  priceDiscount: number;

  @Column()
  summary: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  imageCover: string;

  @Column('text', { array: true })
  images: string[];

  @CreateDateColumn()
  createdAt: Date;

  @Column('timestamp', { array: true })
  startDates: Date[];

  @Column({ type: 'boolean', default: false })
  secretTour: boolean;

  @Column('geometry', { spatialFeatureType: 'Point', srid: 4326 })
  startLocation: string;

  @OneToMany(() => Location, (location) => location.tour, { cascade: true })
  locations: Location[];

  @OneToMany(() => Review, (review) => review.tour)
  reviews: Review[];

  @ManyToMany(() => User, (user) => user.tours)
  @JoinTable({
    name: 'tour_guides', // Join table name
    joinColumn: { name: 'tourId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  guides: User[];
}
