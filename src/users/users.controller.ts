import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List users' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
                @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted' };
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.restore(id);
    return { message: 'User restored', user };
  }

  @Post(':id/change-password')
  @ApiBearerAuth()
  async changePassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(id, dto);
    return { message: 'Password changed' };
  }

  @Post(':id/lock')
  @ApiBearerAuth()
  async lockAccount(@Param('id', ParseUUIDPipe) id: string, @Query('minutes') minutes?: number) {
    await this.usersService.lockAccount(id, minutes);
    return { message: 'Account locked' };
  }

  @Post(':id/unlock')
  @ApiBearerAuth()
  async unlockAccount(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.unlockAccount(id);
    return { message: 'Account unlocked' };
  }
}
