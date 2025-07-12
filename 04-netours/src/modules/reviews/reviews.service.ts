// review.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { TourService } from '../tours/tours.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private tourService: TourService,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepository.create({
      review: createReviewDto.review,
      rating: createReviewDto.rating,
      tour: { id: createReviewDto.tourId },
      user: { id: createReviewDto.userId },
    });

    const savedReview = await this.reviewRepository.save(review);
    await this.calcAverageRatings(createReviewDto.tourId);
    return savedReview;
  }

  async findAll(tourId?: string): Promise<Review[]> {
    if (tourId) {
      return this.reviewRepository.find({
        where: {
          tour: { id: tourId },
        },
        relations: ['user'],
      });
    }
    return this.reviewRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    Object.assign(review, updateReviewDto);
    const savedReview = await this.reviewRepository.save(review);

    await this.calcAverageRatings(review.tour.id);
    return savedReview;
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    const tourId = review.tour.id;

    await this.reviewRepository.remove(review);
    await this.calcAverageRatings(tourId);
  }

  async calcAverageRatings(tourId: string): Promise<void> {
    // Calculate average ratings using TypeORM
    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(*)', 'nReviews')
      .addSelect('AVG(review.rating)', 'avgRating')
      .where('review.tourId = :tourId', { tourId })
      .getRawOne();

    if (stats && stats.nReviews > 0) {
      await this.tourService.updateRatings(
        tourId,
        parseInt(stats.nReviews),
        parseFloat(stats.avgRating),
      );
    } else {
      await this.tourService.updateRatings(tourId, 0, 4.5);
    }
  }
}
