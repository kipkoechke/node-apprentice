import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception-filter';
import { HttpExceptionFilter } from './common/filters/http-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(), new GlobalExceptionFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
