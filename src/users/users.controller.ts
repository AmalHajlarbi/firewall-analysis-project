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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeOwnPasswordDto, AdminChangePasswordDto } from './dto/change-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permission, UserRole } from '../common/enums/role-permission.enum';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --------------------------------------------------------------------------------
  // CREATE & LIST USERS
  // --------------------------------------------------------------------------------

  @Post()
  @Permissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Create user (requires MANAGE_USERS permission)' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Permissions(Permission.VIEW_USERS)
  @ApiOperation({ summary: 'List users (requires VIEW_USERS permission)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  // --------------------------------------------------------------------------------
  // PROFILE
  // --------------------------------------------------------------------------------

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile (requires VIEW_USERS permission)' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  // --------------------------------------------------------------------------------
  // READ / UPDATE / DELETE BY ID
  // --------------------------------------------------------------------------------

  @Get(':id')
  @Permissions(Permission.VIEW_USERS)
  @ApiOperation({ summary: 'Get user by ID (requires VIEW_USERS permission)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Update user (requires MANAGE_USERS permission)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Delete user (requires MANAGE_USERS permission)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted' };
  }

  @Post(':id/restore')
  @Permissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Restore user (requires MANAGE_USERS permission)' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.restore(id);
    return { message: 'User restored', user };
  }

  // --------------------------------------------------------------------------------
  // ROLE MANAGEMENT
  // --------------------------------------------------------------------------------

  @Patch(':id/role')
  @Permissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Update user role (requires MANAGE_USERS permission)' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() currentUser: any,
  ) {
    const updated = await this.usersService.updateRole(id, dto, currentUser.id);
    return { message: 'User role updated', user: updated };
  }

  // --------------------------------------------------------------------------------
  // PASSWORD MANAGEMENT
  // --------------------------------------------------------------------------------

  @Post('change-password')
  @ApiOperation({ summary: 'Change own password (requires MANAGE_USERS permission)' })
  async changeOwnPassword(
    @CurrentUser() user: any,
    @Body() dto: ChangeOwnPasswordDto,
  ) {
    await this.usersService.changeOwnPassword(user.id, dto);
    return { message: 'Password changed successfully' };
  }

  @Post(':id/change-password')
  @Permissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Change another user’s password (requires MANAGE_USERS permission)' })
  async changeUserPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminChangePasswordDto,
  ) {
    await this.usersService.adminChangePassword(id, dto);
    return { message: 'Password changed' };
  }

  // --------------------------------------------------------------------------------
  // LOCK / UNLOCK
  // --------------------------------------------------------------------------------

  @Post(':id/lock')
  @Permissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Lock user account (requires MANAGE_USERS permission)' })
  async lockAccount(
    @Param('id', ParseUUIDPipe) id: string, 
    @Query('minutes') minutes?: number,
  ) {
    await this.usersService.lockAccount(id, minutes);
    return { message: 'Account locked' };
  }

  @Post(':id/unlock')
  @Permissions(Permission.MANAGE_USERS)
  @ApiOperation({ summary: 'Unlock user account (requires MANAGE_USERS permission)' })
  async unlockAccount(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.unlockAccount(id);
    return { message: 'Account unlocked' };
  }
}
