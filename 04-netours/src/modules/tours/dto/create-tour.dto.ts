// create-tour.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Difficulty } from '../enums/difficulty.enum';
import { CreateLocationDto } from './create-location.dto';

export class CreateTourDto {
  @IsString()
  @MinLength(10, {
    message: 'A tour name must have more or equal than 10 characters',
  })
  @MaxLength(40, {
    message: 'A tour name must have less or equal than 40 characters',
  })
  name: string;

  @IsNumber()
  duration: number;

  @IsNumber()
  maxGroupSize: number;

  @IsEnum(Difficulty, {
    message: 'Difficulty is either: easy, medium, difficult',
  })
  difficulty: Difficulty;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Rating must be above 1.0' })
  @Max(5, { message: 'Rating must be below 5.0' })
  ratingsAverage?: number;

  @IsNumber()
  @IsOptional()
  ratingsQuantity?: number;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  priceDiscount?: number;

  @IsString()
  summary: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  imageCover: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  startDates: Date[];

  @IsBoolean()
  @IsOptional()
  secretTour?: boolean;

  @IsString()
  startLocationDescription: string;

  @IsString()
  startLocationAddress: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  startLocationCoordinates: number[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateLocationDto)
  locations?: CreateLocationDto[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  guides?: string[];
}
