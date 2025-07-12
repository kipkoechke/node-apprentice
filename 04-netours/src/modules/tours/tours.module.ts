import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { multerOptions } from 'src/common/config/multer.config';
import { ImageService } from 'src/common/services/image.service';
import { UserModule } from '../users/users.module';
import { Location } from './entities/location.entity';
import { Tour } from './entities/tour.entity';
import { TourController } from './tours.controller';
import { TourService } from './tours.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tour, Location]),
    UserModule,
    MulterModule.register(multerOptions),
  ],
  controllers: [TourController],
  providers: [TourService, ImageService],
  exports: [TourService],
})
export class TourModule {}
