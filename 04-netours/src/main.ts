import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception-filter';
import { MulterExceptionFilter } from './common/filters/multer-exception-filter';
import { UnifiedGlobalExceptionFilter } from './common/filters/unified-global-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the HttpAdapterHost instance
  const httpAdapterHost = app.get(HttpAdapterHost);

  // Register global exception filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new UnifiedGlobalExceptionFilter(httpAdapterHost),
    new MulterExceptionFilter(),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
