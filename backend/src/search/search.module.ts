import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';

@Module({
   imports: [TypeOrmModule.forFeature([FirewallLogEntity])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
