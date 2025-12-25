import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './search/search.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { UserModule } from './users/users.module';
import { ConfigModule} from '@nestjs/config';

@Module({
  imports: [ 
    ConfigModule.forRoot({ isGlobal: true }), // ✅ Loads .env variables
    TypeOrmModule.forRoot({ // ✅ Configure database connection here
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Be careful in prod!
    }),
    AuthModule,
    UserModule,
    AuditModule,
    SearchModule,
    AnalysisModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
