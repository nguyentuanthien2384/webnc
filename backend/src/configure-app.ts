import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CastErrorFilter } from './common/filters/cast-error.filter';

export function configureApp(app: INestApplication) {
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalFilters(new CastErrorFilter());
  app.setGlobalPrefix('api');
}
