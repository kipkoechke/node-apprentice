// review.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourModule } from '../tours/tours.module';
import { Review } from './entities/review.entity';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
@Module({
  imports: [TypeOrmModule.forFeature([Review]), TourModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
