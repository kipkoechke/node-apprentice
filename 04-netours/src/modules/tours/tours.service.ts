import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { ImageService } from 'src/common/services/image.service';
import { ApiFeatures } from 'src/common/utils/api-features';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Location } from './entities/location.entity';
import { Tour } from './entities/tour.entity';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private imageService: ImageService,
  ) {}

  async findAll(queryParams: any) {
    const apiFeatures = new ApiFeatures(this.tourRepository, queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const [tours, count] = await apiFeatures.query.getManyAndCount();

    return {
      status: 'success',
      results: count,
      data: { data: tours },
    };
  }

  async findOne(id: string) {
    const tour = await this.tourRepository.findOne({
      where: { id },
      relations: ['locations', 'guides', 'reviews'],
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return {
      status: 'success',
      data: { data: tour },
    };
  }

  async create(
    createTourDto: CreateTourDto,
    files: {
      imageCover?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    user: User,
  ) {
    try {
      // Create slug from name
      const slug = slugify(createTourDto.name, { lower: true });

      // Process uploaded images
      const imageCoverPath = files.imageCover
        ? await this.imageService.saveImage(
            files.imageCover[0],
            'public/img/tours',
            {
              width: 2000,
              height: 1333,
              quality: 80,
            },
          )
        : null;

      const imagesPaths = files.images
        ? await Promise.all(
            files.images.map((img, index) =>
              this.imageService.saveImage(img, 'public/img/tours', {
                index,
                width: 2000,
                height: 1333,
                quality: 80,
              }),
            ),
          )
        : [];

      // Create tour object without using repository.create()
      const tourData = {
        ...createTourDto,
        slug,
        imageCover: imageCoverPath,
        images: imagesPaths,
      };

      // Handle guides separately
      if (createTourDto.guides && createTourDto.guides.length > 0) {
        tourData.guides = createTourDto.guides;
      }

      // Handle locations separately if needed
      if (createTourDto.locations && createTourDto.locations.length > 0) {
        // Create and save locations first if they need to be new entities
        const locations = await Promise.all(
          createTourDto.locations.map((locationDto) =>
            this.locationRepository.save(
              this.locationRepository.create({
                ...locationDto,
                coordinates: {
                  type: 'Point',
                  coordinates: locationDto.coordinates,
                },
              }),
            ),
          ),
        );
        tourData.locations = locations.map((location) => ({
          ...location,
          coordinates: location.coordinates.coordinates,
        }));
      }

      // Now create and save the tour
      const tour = this.tourRepository.create(
        tourData as unknown as DeepPartial<Tour>,
      );
      const savedTour = await this.tourRepository.save(tour);

      return {
        status: 'success',
        data: { data: savedTour },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create tour: ${errorMessage}`);
    }
  }

  async update(
    id: string,
    updateTourDto: UpdateTourDto,
    files: {
      imageCover?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const tour = await this.tourRepository.findOne({ where: { id } });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    // Create an update object
    const updateData: Partial<Tour> = {};

    // Copy allowed properties from the DTO
    Object.keys(updateTourDto).forEach((key) => {
      if (key !== 'guides' && key !== 'locations') {
        updateData[key] = updateTourDto[key];
      }
    });

    // Update slug if name is updated
    if (updateTourDto.name) {
      updateData.slug = slugify(updateTourDto.name, { lower: true });
    }

    // Process uploaded images if any
    if (files.imageCover && files.imageCover.length > 0) {
      const imageCoverPath = await this.imageService.saveImage(
        files.imageCover[0],
        'tours',
        {
          width: 2000,
          height: 1333,
          quality: 80,
        },
      );
      updateData.imageCover = imageCoverPath;
    }

    if (files.images && files.images.length > 0) {
      const imagesPaths = await Promise.all(
        files.images.map((img, index) =>
          this.imageService.saveImage(img, 'tours', {
            index,
            width: 2000,
            height: 1333,
            quality: 80,
          }),
        ),
      );
      updateData.images = imagesPaths;
    }

    // Update tour with new data
    await this.tourRepository.update(id, updateData);

    // Handle relationships separately if needed
    if (updateTourDto.guides) {
      // Update guides relationship
      tour.guides = updateTourDto.guides.map(
        (guideId) => ({ id: guideId }) as User,
      );
      await this.tourRepository.save(tour);
    }

    if (updateTourDto.locations) {
      // Handle locations update - this depends on your exact data model
      const locations = await Promise.all(
        updateTourDto.locations.map((locationDto) =>
          this.locationRepository.save(
            this.locationRepository.create({
              ...locationDto,
              coordinates: {
                type: 'Point',
                coordinates: locationDto.coordinates,
              },
            }),
          ),
        ),
      );
      tour.locations = locations;
      await this.tourRepository.save(tour);
    }

    // Fetch updated tour
    const updatedTour = await this.tourRepository.findOne({
      where: { id },
      relations: ['locations', 'guides'],
    });

    return {
      status: 'success',
      data: { data: updatedTour },
    };
  }
  async remove(id: string) {
    const tour = await this.tourRepository.findOne({ where: { id } });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    await this.tourRepository.remove(tour);

    return {
      status: 'success',
      data: null,
    };
  }

  async getStatistics() {
    const stats = await this.tourRepository
      .createQueryBuilder('tour')
      .select([
        'tour.difficulty',
        'COUNT(tour.id) as numTours',
        'AVG(tour.ratingsAverage) as avgRating',
        'MIN(tour.price) as minPrice',
        'MAX(tour.price) as maxPrice',
      ])
      .groupBy('tour.difficulty')
      .getRawMany();

    return {
      status: 'success',
      data: { stats },
    };
  }

  async getMonthlyPlan(year: number) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // Use a raw query or createQueryBuilder
    // to unnest the startDates array and count tours per month
    const plan = await this.tourRepository.query(
      `
      SELECT
        EXTRACT(MONTH FROM dates) as month,
        COUNT(*) as numTourStarts,
        array_agg(name) as tours
      FROM
        tour,
        unnest(start_dates) as dates
      WHERE
        dates BETWEEN $1 AND $2
      GROUP BY
        month
      ORDER BY
        num_tour_starts DESC
    `,
      [startDate, endDate],
    );

    return {
      status: 'success',
      data: { plan },
    };
  }

  async getToursWithin(
    distance: number,
    latlng: { lat: number; lng: number },
    unit: string,
  ) {
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    // Create a PostgreSQL geography point
    const point = `POINT(${latlng.lng} ${latlng.lat})`;

    const tours = await this.tourRepository
      .createQueryBuilder('tour')
      .where(
        `ST_DWithin(
          tour.startLocation::geography,
          ST_SetSRID(ST_GeomFromText(:point), 4326)::geography,
          :radius
        )`,
        { point, radius },
      )
      .getMany();

    return {
      status: 'success',
      results: tours.length,
      data: { data: tours },
    };
  }

  async getDistances(latlng: { lat: number; lng: number }, unit: string) {
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    const point = `POINT(${latlng.lng} ${latlng.lat})`;

    const distances = await this.tourRepository
      .createQueryBuilder('tour')
      .select([
        'tour.id as id',
        'tour.name as name',
        `ST_Distance(
          tour.startLocation::geography,
          ST_SetSRID(ST_GeomFromText(:point), 4326)::geography
        ) * :multiplier as distance`,
      ])
      .setParameters({ point, multiplier })
      .orderBy('distance', 'ASC')
      .getRawMany();

    return {
      status: 'success',
      data: { data: distances },
    };
  }

  async updateRatings(
    tourId: string,
    ratingsQuantity: number,
    ratingsAverage: number,
  ): Promise<void> {
    await this.tourRepository.update(
      { id: tourId },
      { ratingsQuantity, ratingsAverage },
    );
  }
}
