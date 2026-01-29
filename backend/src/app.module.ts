import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';
import { AuthAuditModule } from './authaudit/authaudit.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SearchModule } from './search/search.module';

import { LogsModule } from './logs/logs.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ReportsModule } from './reports/reports.module';


@Module({
  imports: [ 
    ConfigModule.forRoot({ isGlobal: true ,
                           load: [ () => require ('./config/configuration').default()],
                        }), 
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,SearchModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
      }),
    }),
    AuthModule,
    AuthAuditModule,
    UsersModule,
    AuditModule,
    SearchModule,
    AnalysisModule,
    ReportsModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}