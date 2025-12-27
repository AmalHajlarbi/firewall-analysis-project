import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {ChangeOwnPasswordDto, AdminChangePasswordDto} from './dto/change-password.dto';
import { UserRole } from 'backend/src/common/enums/role-permission.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.usersRepository.findOne({ where: { email: dto.email }, withDeleted: true }))
      throw new ConflictException('Email exists');
    if (await this.usersRepository.findOne({ where: { username: dto.username }, withDeleted: true }))
      throw new ConflictException('Username exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({ ...dto, passwordHash, isActive: dto.isActive ?? true, role: dto.role ?? UserRole.ANALYST });
    return this.usersRepository.save(user);
  }

async findAll(
  page = 1,
  limit = 20,
): Promise<{ users: User[]; total: number; page: number; lastPage: number }> {
  const total = await this.usersRepository.count({
    where: { deletedAt: IsNull() },
  });

  const lastPage = Math.ceil(total / limit);

  const safePage = page > lastPage ? lastPage : page;

  const users = await this.usersRepository.find({
    where: { deletedAt: IsNull() },
    skip: (safePage - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  return { users, total, page: safePage, lastPage };

  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async findOneWithPassword(id: string): Promise<User> {
  const user = await this.usersRepository
    .createQueryBuilder('user')
    .addSelect('user.passwordHash')
    .addSelect('user.refreshTokenHash')
    .where('user.id = :id', { id })
    .andWhere('user.deleted_at IS NULL')
    .getOne();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }


  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    // Prevent deleting last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.usersRepository.count({
        where: { role: UserRole.ADMIN, deletedAt: IsNull() },
      });
      
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin');
      }
    }
    
    await this.usersRepository.softRemove(user);
  }

  async restore(id: string): Promise<User> {
    await this.usersRepository.restore(id);
    return this.findOne(id);
  }

  async updateRole(id: string, dto: UpdateRoleDto, adminId: string): Promise<User> {
    const user = await this.findOne(id);

    // prevent admins from changing their own role
    if (user.id === adminId) {
      throw new BadRequestException('Admins cannot change their own role');
    }
    if (user.role === UserRole.ADMIN && dto.role !== UserRole.ADMIN) {
    const adminCount = await this.usersRepository.count({
      where: { role: UserRole.ADMIN, deletedAt: IsNull() },
    });

    if (adminCount <= 1) {
      throw new BadRequestException('Cannot remove last admin');
    }
    }
      user.role = dto.role;
      return this.usersRepository.save(user);
    }



  async changeOwnPassword(id: string, dto: ChangeOwnPasswordDto): Promise<void> {
    const user = await this.findOneWithPassword(id);
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash)))
      throw new BadRequestException('Current password incorrect');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.save(user);
  }

  async lockAccount(id: string, minutes = 15): Promise<void> {
    const lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
    await this.usersRepository.update(id, { lockedUntil });
  }
    async adminChangePassword(
    id: string,
    dto: AdminChangePasswordDto,
    ): Promise<void> {
    const user = await this.findOneWithPassword(id);

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await this.usersRepository.save(user);
  }

  async unlockAccount(id: string): Promise<void> {
    await this.usersRepository.update(id, { lockedUntil: null, failedLoginAttempts: 0 });
  }

  async isLocked(id: string): Promise<boolean> {
    const user = await this.findOne(id);
    return !!(user.lockedUntil && user.lockedUntil > new Date());
    }
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }


  async resetFailedAttempts(id: string): Promise<void> {
    await this.usersRepository.update(id, { 
      failedLoginAttempts: 0,
      lockedUntil: null 
    });
  }

  async incrementFailedAttempts(id: string): Promise<void> {
    await this.usersRepository.increment({ id }, 'failedLoginAttempts', 1);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }

  async setCurrentRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, { refreshTokenHash: hash });
  }

  async removeRefreshToken(userId: string) {
    await this.usersRepository.update(userId, { refreshTokenHash: null });
  }
}
