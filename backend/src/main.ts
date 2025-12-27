// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Create app
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe (Course Page 104-106)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not defined in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert string to number, etc.
      },
    }),
  );
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });
  
  // Swagger documentation (optional but useful)
  const config = new DocumentBuilder()
    .setTitle('Firewall Log Analysis Platform')
    .setDescription('API for managing firewall logs and users')
    .setVersion('1.0')
    .addBearerAuth() // For JWT auth later
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Get port from configuration
  const port = process.env.APP_PORT || 3000;
  
  // Start server
  await app.listen(port);
  
  logger.log(` Application is running on: http://localhost:${port}`);
  logger.log(` Swagger documentation: http://localhost:${port}/api`);
  logger.log(` Environment: ${process.env.NODE_ENV}`);
  logger.log(` Database: ${process.env.DB_DATABASE}`);
}

bootstrap();
