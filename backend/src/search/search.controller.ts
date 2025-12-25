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
/*
  @Post()
  create(@Body() createSearchDto: CreateSearchDto) {
    return this.searchService.create(createSearchDto);
  }

  @Get()
  findAll() {
    return this.searchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSearchDto: UpdateSearchDto) {
    return this.searchService.update(+id, updateSearchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.searchService.remove(+id);
  }*/
}
