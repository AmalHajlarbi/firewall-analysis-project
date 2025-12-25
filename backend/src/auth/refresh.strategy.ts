import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string) {
    const user = await this.authService.validateRefreshToken(token);
    if (!user) throw new UnauthorizedException();
    return { user, token };
  }
}
