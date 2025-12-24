import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email exists (including soft-deleted)
    const existingEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
      withDeleted: true,
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username exists (including soft-deleted)
    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
      withDeleted: true,
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    try {
      const user = this.usersRepository.create({
        email: createUserDto.email,
        username: createUserDto.username,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        passwordHash: createUserDto.password, // Auto-hashed by entity @BeforeInsert
        isActive: createUserDto.isActive ?? true,
        // Other fields use defaults from entity and SoftDeleteEntity
      });

      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`User created: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    isActive?: boolean,
  ): Promise<{ users: User[]; total: number }> {
    // TypeORM automatically filters out soft-deleted records
    // because we're using @DeleteDateColumn() in SoftDeleteEntity
    const query = this.usersRepository.createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (search) {
      query.andWhere(
        '(user.email LIKE :search OR user.username LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    query.orderBy('user.createdAt', 'DESC');

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    this.logger.log(`Found ${users.length} users (total: ${total})`);
    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    // TypeORM automatically excludes soft-deleted when not using withDeleted
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    
    if (!user || user.deletedAt) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findOneWithDeleted(id: string): Promise<User> {
    // Explicitly include soft-deleted records
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if new email already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.findByEmail(updateUserDto.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if new username already exists
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.findByUsername(updateUserDto.username);
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    // Update fields (type-safe)
    Object.assign(user, updateUserDto);

    const updatedUser = await this.usersRepository.save(user);
    this.logger.log(`User updated: ${id}`);
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    // softRemove automatically sets deletedAt
    await this.usersRepository.softRemove(user);
    this.logger.log(`User soft-deleted: ${id}`);
  }

  async restore(id: string): Promise<User> {
    const user = await this.findOneWithDeleted(id);
    
    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }
    
    // restore() automatically sets deletedAt to null
    await this.usersRepository.restore(id);
    
    const restoredUser = await this.findOne(id);
    this.logger.log(`User restored: ${id}`);
    return restoredUser;
  }

  async hardRemove(id: string): Promise<void> {
    const user = await this.findOneWithDeleted(id);
    await this.usersRepository.remove(user);
    this.logger.log(`User hard-deleted: ${id}`);
  }

  // PASSWORD OPERATIONS 

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findOne(id);

    // Validate current password
    const isValid = await this.validatePassword(changePasswordDto.currentPassword, user);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password (auto-hashed by entity @BeforeUpdate)
    user.passwordHash = changePasswordDto.newPassword;
    await this.usersRepository.save(user);
    this.logger.log(`Password changed for user: ${id}`);
  }

  async validatePassword(password: string, user: User): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    user.passwordHash = newPassword; // Auto-hashed by entity @BeforeUpdate
    await this.usersRepository.save(user);
    this.logger.log(`Password reset by admin for user: ${id}`);
  }

  // SECURITY OPERATIONS 

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
    this.logger.log(`Last login updated for user: ${id}`);
  }

  async incrementFailedAttempts(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.failedLoginAttempts += 1;
    
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await this.usersRepository.save(user);
    this.logger.log(`Failed attempts: ${id} (total: ${user.failedLoginAttempts})`);
  }

  async resetFailedAttempts(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    this.logger.log(`Failed attempts reset for user: ${id}`);
  }

  async isLocked(id: string): Promise<boolean> {
    const user = await this.findOne(id);
    if (!user.lockedUntil) return false;
    return user.lockedUntil > new Date();
  }

  async lockAccount(id: string, minutes: number = 15): Promise<void> {
    const lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
    await this.usersRepository.update(id, { lockedUntil });
    this.logger.log(`Account locked: ${id} until ${lockedUntil}`);
  }

  async unlockAccount(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    this.logger.log(`Account unlocked: ${id}`);
  }

  // STATUS OPERATIONS 

  async setActiveStatus(id: string, isActive: boolean): Promise<void> {
    await this.usersRepository.update(id, { isActive });
    this.logger.log(`Active status: ${id} = ${isActive}`);
  }

  async verifyEmail(id: string): Promise<void> {
    await this.usersRepository.update(id, { isVerified: true });
    this.logger.log(`Email verified: ${id}`);
  }

  // UTILITY METHODS 

  async exists(id: string): Promise<boolean> {
    const count = await this.usersRepository.count({
      where: { id },
    });
    return count > 0;
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    verified: number;
    locked: number;
    deleted: number;
  }> {
    // Using MoreThan operator for locked accounts (lockedUntil > now)
    const now = new Date();
    
    const [total, active, verified, locked, deleted] = await Promise.all([
      this.usersRepository.count({ where: { deletedAt: IsNull() } }),
      this.usersRepository.count({ where: { isActive: true, deletedAt: IsNull() } }),
      this.usersRepository.count({ where: { isVerified: true, deletedAt: IsNull() } }),
      this.usersRepository.count({ 
        where: { 
          lockedUntil: MoreThan(now),
          deletedAt: IsNull() 
        } 
      }),
      this.usersRepository.count({ where: { deletedAt: Not(IsNull()) } }),
    ]);

    return { total, active, verified, locked, deleted };
  }

  async getUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'ASC')
      .getMany();
  }
}