// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // ← Auto-excludes @Exclude() fields
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //PUBLIC ENDPOINTS 

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or username already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
    // passwordHash auto-excluded by @Exclude() + ClassSerializerInterceptor
  }

  //PROTECTED ENDPOINTS

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('isActive', new DefaultValuePipe(undefined), ParseBoolPipe)
    isActive?: boolean,
  ) {
    return await this.usersService.findAll(page, limit, search, isActive);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email or username already exists',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user (soft delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  //PASSWORD ENDPOINTS

  @Post(':id/change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Current password is incorrect',
  })
  async changePassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post(':id/reset-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async resetPassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.usersService.resetPassword(id, newPassword);
    return { message: 'Password reset successfully' };
  }

  //SECURITY ENDPOINTS

  @Post(':id/lock')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lock user account (admin only)' })
  @ApiQuery({ name: 'minutes', required: false, type: Number, example: 15 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account locked successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async lockAccount(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('minutes', new DefaultValuePipe(15), ParseIntPipe) minutes: number,
  ) {
    await this.usersService.lockAccount(id, minutes);
    return { message: `Account locked for ${minutes} minutes` };
  }

  @Post(':id/unlock')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlock user account (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account unlocked successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async unlockAccount(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.unlockAccount(id);
    return { message: 'Account unlocked successfully' };
  }

  @Get(':id/lock-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if account is locked' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lock status retrieved',
  })
  async getLockStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    const isLocked = await this.usersService.isLocked(id);
    const user = await this.usersService.findOne(id);
    return { isLocked, lockedUntil: user.lockedUntil };
  }

  //STATUS ENDPOINTS

  @Post(':id/activate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account activated successfully',
  })
  async activateAccount(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.setActiveStatus(id, true);
    return { message: 'Account activated successfully' };
  }

  @Post(':id/deactivate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account deactivated successfully',
  })
  async deactivateAccount(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.setActiveStatus(id, false);
    return { message: 'Account deactivated successfully' };
  }

  @Post(':id/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
  })
  async verifyEmail(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.verifyEmail(id);
    return { message: 'Email verified successfully' };
  }

  //ADMIN ENDPOINTS

  @Get(':id/with-deleted')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user including soft-deleted (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  async findOneWithDeleted(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findOneWithDeleted(id);
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore soft-deleted user (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User restored successfully',
  })
  async restore(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.restore(id);
    return { message: 'User restored successfully', user };
  }

  @Delete(':id/hard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete user (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User permanently deleted',
  })
  async hardRemove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.hardRemove(id);
    return { message: 'User permanently deleted' };
  }

  @Get('system/statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system user statistics (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  async getSystemStatistics() {
    return await this.usersService.getStatistics();
  }

  //UTILITY ENDPOINTS 

  @Get('email/:email')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  @Get('username/:username')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  async findByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  @Get('exists/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user exists' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Existence check completed',
  })
  async exists(@Param('id', new ParseUUIDPipe()) id: string) {
    const exists = await this.usersService.exists(id);
    return { exists };
  }
}