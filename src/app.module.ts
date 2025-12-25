// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration Module (Loads .env files)
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
      load: [configuration], // Load our configuration
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Load specific .env file
    }),
    
    // Database Module (Async configuration)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Auto-load all entities
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        charset: 'utf8mb4',
        timezone: 'Z', // UTC timezone
        // Connection pool settings
        extra: {
          connectionLimit: 10,
        },
      }),
    }),
    
    // Feature Modules
    UsersModule,
    
  ],
})
export class AppModule {}
