import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Role } from './role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Role)
    private rolesRepo: Repository<Role>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email }, relations: ['roles'] });
  }

  async createUser(email: string, password: string, roles: string[]) {
    const roleEntities = await this.rolesRepo.findBy(roles.map(r => ({ name: r })));
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ email, password: hashed, roles: roleEntities });
    return this.usersRepo.save(user);
  }
}
