import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/config/multer.config';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ParseGeoPointPipe } from 'src/common/pipes/parse-geo-point.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { TourService } from './tours.service';

@Controller('api/v1/tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  async getAllTours(@Query() queryParams) {
    return this.tourService.findAll(queryParams);
  }

  @Get('top-5-cheap')
  async getTopTours() {
    // Pre-filling query params to get top 5 cheap tours
    const queryParams = {
      limit: '5',
      sort: 'price,-ratingsAverage',
      fields: 'name,price,ratingsAverage,summary,difficulty',
    };
    return this.tourService.findAll(queryParams);
  }

  @Get('tour-stats')
  async getTourStats() {
    return this.tourService.getStatistics();
  }

  @Get('monthly-plan/:year')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LEAD_GUIDE, Role.GUIDE)
  async getMonthlyPlan(@Param('year') year: string) {
    return this.tourService.getMonthlyPlan(parseInt(year));
  }

  @Get('tours-within/:distance/center/:latlng/unit/:unit')
  async getToursWithin(
    @Param('distance') distance: string,
    @Param('latlng', ParseGeoPointPipe) latlng: { lat: number; lng: number },
    @Param('unit') unit: string,
  ) {
    return this.tourService.getToursWithin(parseFloat(distance), latlng, unit);
  }

  @Get('distances/:latlng/unit/:unit')
  async getDistances(
    @Param('latlng', ParseGeoPointPipe) latlng: { lat: number; lng: number },
    @Param('unit') unit: string,
  ) {
    return this.tourService.getDistances(latlng, unit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LEAD_GUIDE)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 3 },
      ],
      multerOptions,
    ),
  )
  async createTour(
    @Body() createTourDto: CreateTourDto,
    @UploadedFiles()
    files: {
      imageCover?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    @CurrentUser() user: User,
  ) {
    return this.tourService.create(createTourDto, files, user);
  }

  @Get(':id')
  async getTour(@Param('id', ParseUUIDPipe) id: string) {
    return this.tourService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LEAD_GUIDE)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 3 },
      ],
      multerOptions,
    ),
  )
  async updateTour(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTourDto: UpdateTourDto,
    @UploadedFiles()
    files: {
      imageCover?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.tourService.update(id, updateTourDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LEAD_GUIDE)
  async deleteTour(@Param('id', ParseUUIDPipe) id: string) {
    return this.tourService.remove(id);
  }
}
