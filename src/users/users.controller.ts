import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from 'src/common/enums/role-permission.enum';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from 'src/common/decorators/roles.decorator';



@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted' };
  }

  @Post(':id/restore')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.restore(id);
    return { message: 'User restored', user };
  }

  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role (admin only)' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req,
  ) {
    const updated = await this.usersService.updateRole(id, dto, req.user.id);
    return { message: 'User role updated', user: updated };
  }

  @Post(':id/change-password')
  @ApiBearerAuth()
  async changePassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(id, dto);
    return { message: 'Password changed' };
  }

  @Post(':id/lock')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async lockAccount(@Param('id', ParseUUIDPipe) id: string, @Query('minutes') minutes?: number) {
    await this.usersService.lockAccount(id, minutes);
    return { message: 'Account locked' };
  }

  @Post(':id/unlock')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async unlockAccount(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.unlockAccount(id);
    return { message: 'Account unlocked' };
  }
}

