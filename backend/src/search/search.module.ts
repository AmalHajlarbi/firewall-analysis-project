import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Log } from 'src/logs/entities/log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports: [TypeOrmModule.forFeature([Log])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
