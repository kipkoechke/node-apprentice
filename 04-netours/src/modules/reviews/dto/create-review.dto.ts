import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  review: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  tourId?: string;
  userId?: string;
}
