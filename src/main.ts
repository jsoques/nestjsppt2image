import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { config } from 'dotenv';

config();

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'images'));
  app.enableCors();
  Logger.log('CORS enabled', 'Main bootstrap');
  // app.useStaticAssets(join(__dirname, '..', 'images'));
  // app.setBaseViewsDir(join(__dirname, '..', 'images'));
  // app.setViewEngine('hbs');
  await app.listen(port);
  Logger.log(`Application listening on port ${port}`, 'Main bootstrap');
}
bootstrap();
