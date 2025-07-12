import slugify from 'slugify';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { Difficulty } from '../enums/difficulty.enum';
import { Location } from './location.entity';

@Entity()
@Index(['price', 'ratingsAverage'])
@Index(['slug'])
@Index(['startLocation'], { spatial: true })
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

  @Column('text', { array: true, default: [] })
  images: string[];

  @CreateDateColumn()
  createdAt: Date;

  @Column('timestamp', { array: true })
  startDates: Date[];

  @Column({ type: 'boolean', default: false })
  secretTour: boolean;

  @Column('geometry', { spatialFeatureType: 'Point', srid: 4326 })
  startLocation: Point;

  @OneToMany(() => Location, (location) => location.tour, { cascade: true })
  locations: Location[];

  @OneToMany(() => Review, (review) => review.tour)
  reviews: Review[];

  @ManyToMany(() => User, (user) => user.tours)
  @JoinTable({
    name: 'tour_guides',
    joinColumn: { name: 'tourId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  guides: User[];

  // Virtual field for duration in weeks
  getDurationWeeks(): number {
    return this.duration / 7;
  }

  // Hooks for slug generation
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = slugify(this.name, { lower: true });
    }
  }
}
