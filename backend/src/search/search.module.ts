import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports: [TypeOrmModule.forFeature([FirewallLogEntity])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
