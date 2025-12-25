import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('refresh')
  async refreshToken(@Body('refreshToken') rt: string) {
  return this.authService.refresh(rt);
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Body('refreshToken') rt: string) {
    await this.authService.logout(req.user.userId, rt);
    return { message: 'Logged out' };
  }
}