import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './search/search.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ReportsModule } from './reports/reports.module';
import { LogsModule } from './logs/logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [SearchModule, AnalysisModule, ReportsModule, LogsModule,
      TypeOrmModule.forRoot({
      type: 'mysql',          // ou postgres
      host: 'localhost',
      port: 3306,
      username: 'amal',
      password: 'root',
      database: 'firewall_logs_db',
      autoLoadEntities: true,
      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
