import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';

import { DatabaseModule } from './database/database.module';
import { ReviewModule } from './modules/reviews/reviews.module';
import { TourModule } from './modules/tours/tours.module';
import { UserModule } from './modules/users/users.module';

dotenv.config();
const config = configuration();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // TypeOrmModule.forRoot(dataSourceOptions),
    DatabaseModule,
    AuthModule,
    UserModule,
    ReviewModule,
    TourModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
