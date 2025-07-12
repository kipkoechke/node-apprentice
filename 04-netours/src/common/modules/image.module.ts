// common/image/image.module.ts
import { Module } from '@nestjs/common';
import { ImageService } from '../services/image.service';

@Module({
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
