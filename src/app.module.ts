import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
//import { AuthModule } from './auth/auth.module';
//import { AuditModule } from './audit/audit.module';
//import { UserModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogsModule } from './logs/logs.module';
import { SearchModule } from './search/search.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [ 
    ConfigModule.forRoot({ isGlobal: true }), // ✅ Loads .env variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, 
        logging: true,
      }),
    }),
    //AuthModule,
    //UserModule,
    //AuditModule,
    SearchModule,
    AnalysisModule,
    ReportsModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

