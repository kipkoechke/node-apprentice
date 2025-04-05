import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();
const isDevelopment = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        database: configService.get('POSTGRES_DATABASE'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        autoLoadEntities: true,
        // entities: [`${process.cwd()}/dist/src/**/*.entity{.ts,.js}`],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

console.log(
  'Entities Path:',
  `${process.cwd()}/dist/src/modules/**/entities/*.entity.js`,
);
console.log('Migrations Path:', `${process.cwd()}/dist/src/migrations/*.js`);
