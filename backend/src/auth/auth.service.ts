import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/user.service';
import { LoginDto } from './dtos/login.dto';
import { v4 as uuid } from 'uuid';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuditService } from '../audit/audit.service';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm/repository/Repository.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private rtRepo: Repository<RefreshToken>,
    private audit: AuditService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException();

    const accessToken = this.jwtService.sign({ sub: user.id, roles: user.roles.map(r => r.name) });

    const refreshToken = uuid(); // secure random string
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.rtRepo.save({ token: refreshToken, user, expiresAt });

    await this.audit.log('LOGIN_SUCCESS', user.id, { ip: loginDto.ip });

    return { accessToken, refreshToken };
  }

  async logout(userId: number, refreshToken: string) {
    await this.rtRepo.delete({ token: refreshToken, user: { id: userId } });
    await this.audit.log('LOGOUT', userId, {});
  }

  async refresh(refreshToken: string) {
    const rt = await this.rtRepo.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!rt || rt.expiresAt < new Date()) {
      await this.audit.log('REFRESH_FAILED', rt?.user?.id, { refreshToken });
      throw new UnauthorizedException('Refresh token missing or expired');
    }

    // remove used REFRESH token => rotation
    await this.rtRepo.delete(rt.id);

    // create new pair
    const accessToken = this.jwtService.sign({ sub: rt.user.id, roles: rt.user.roles.map(r => r.name) });
    const newRefreshToken = uuid();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.rtRepo.save({ token: newRefreshToken, user: rt.user, expiresAt });
    await this.audit.log('REFRESH_SUCCESS', rt.user.id, {});

    return { accessToken, refreshToken: newRefreshToken };
  }

  async validateRefreshToken(token: string) {
    const rt = await this.rtRepo.findOne({ where: { token }, relations: ['user', 'user.roles'] });
    if (!rt) return null;
    return rt.user;
  }
}
