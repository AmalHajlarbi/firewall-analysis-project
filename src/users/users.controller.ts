import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  ParseUUIDPipe, 
  DefaultValuePipe, 
  ParseIntPipe, 
  UseInterceptors, 
  ClassSerializerInterceptor, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {ChangeOwnPasswordDto, AdminChangePasswordDto} from './dto/change-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/role-permission.enum';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards to all routes
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create user (Admin only)' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpdateUserDto
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted' };
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore deleted user (Admin only)' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.restore(id);
    return { message: 'User restored', user };
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() currentUser: any,
  ) {
    const updated = await this.usersService.updateRole(id, dto, currentUser.id);
    return { message: 'User role updated', user: updated };
  }

  @Post('change-password')
  async changeOwnPassword(
    @CurrentUser() user: any,
    @Body() dto: ChangeOwnPasswordDto,
  ) {
    await this.usersService.changeOwnPassword(user.id, dto);
    return { message: 'Password changed successfully' };
  }

  @Post(':id/change-password')
  @Roles(UserRole.ADMIN)
  async changeUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminChangePasswordDto,
  ) {
    await this.usersService.adminChangePassword(id, dto);
    return { message: 'Password changed' };
  }

  @Post(':id/lock')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lock user account (Admin only)' })
  async lockAccount(
    @Param('id', ParseUUIDPipe) id: string, 
    @Query('minutes') minutes?: number
  ) {
    await this.usersService.lockAccount(id, minutes);
    return { message: 'Account locked' };
  }

  @Post(':id/unlock')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Unlock user account (Admin only)' })
  async unlockAccount(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.unlockAccount(id);
    return { message: 'Account unlocked' };
  }
}