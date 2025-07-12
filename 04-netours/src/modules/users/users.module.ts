import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { multerOptions } from 'src/common/config/multer.config';
import { ImageModule } from 'src/common/modules/image.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UserService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register(multerOptions),
    ImageModule,
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
