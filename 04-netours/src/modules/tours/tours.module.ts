import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Tour } from './entities/tour.entity';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tour, Location])],
  controllers: [ToursController],
  providers: [ToursService],
})
export class ToursModule {}
