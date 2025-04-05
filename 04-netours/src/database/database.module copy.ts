import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

console.log(__dirname);
console.log(process.cwd());
console.log(
  path.resolve(__dirname, '/../modules/**/entities/*.entity{.ts,.js}'),
);
console.log(path.resolve(process.cwd(), 'src/modules/**/entities/*.entity.ts'));
console.log(
  path.resolve(process.cwd(), 'dist/src/modules/**/entities/*.entity.js'),
);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        provider: 'DATABASE_SOURCE',
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        cli: {
          migrationsDir: 'src/migrations',
        },
        // 'src/modules/**/entities/*.entity.ts'
        // src/modules/tours/entities/tour.entity.ts
        // src/modules/tours/entities/location.entity.ts
        // src/modules/reviews/entities/review.entity.ts
        // src/modules/users/entities/user.entity.ts
        // entities: [
        //   path.resolve(__dirname, '/../modules/**/entities/*.entity{.ts,.js}'),
        // ],
        entities: [
          configService.get('NODE_ENV') !== 'production'
            ? path.resolve(process.cwd(), 'src/modules/**/entities/*.entity.ts')
            : path.resolve(
                process.cwd(),
                'dist/src/modules/**/entities/*.entity.js',
              ),
        ],
        migrations: [
          configService.get('NODE_ENV') !== 'production'
            ? path.resolve(process.cwd(), 'src/migrations/*.ts')
            : path.resolve(process.cwd(), 'dist/migrations/*.js'),
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
