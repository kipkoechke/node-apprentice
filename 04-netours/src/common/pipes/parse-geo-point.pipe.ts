import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseGeoPointPipe implements PipeTransform {
  transform(value: string) {
    if (!value) {
      throw new BadRequestException('Latitude and longitude are required');
    }

    const [lat, lng] = value
      .split(',')
      .map((coord) => parseFloat(coord.trim()));

    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('Latitude and longitude must be numbers');
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new BadRequestException(
        'Latitude must be between -90 and 90, longitude must be between -180 and 180',
      );
    }

    return { lat, lng };
  }
}
