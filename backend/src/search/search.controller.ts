import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchLogsDto } from './dto/search-logs.dto';

@Controller('logs/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  
  @Get()
  search(@Query() dto: SearchLogsDto) {
    return this.searchService.search(dto);
  }
}
