import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchLogsDto } from './dto/search-logs.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permission } from 'src/common/enums/role-permission.enum';
import { Permissions } from 'src/auth/decorators/permissions.decorator';


@Controller('logs/search')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.VIEW_LOGS)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  
  @Get()
  //@Public()
  async search(@Query() query: SearchLogsDto) {
    return this.searchService.search(query);
  }
}