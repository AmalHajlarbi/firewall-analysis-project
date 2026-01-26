import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallLogEntity } from '../logs/entities/firewall-log.entity';
import { LogsModule } from 'src/logs/logs.module';

@Module({
   imports: [TypeOrmModule.forFeature([FirewallLogEntity]), LogsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}