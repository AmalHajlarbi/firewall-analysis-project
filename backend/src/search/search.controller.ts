import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchLogsDto } from './dto/search-logs.dto';


@Controller('logs/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  
  @Get()
  async search(@Query() query: SearchLogsDto) {
    return this.searchService.search(query);
  }
}