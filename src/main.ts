import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Servir le dossier public
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
