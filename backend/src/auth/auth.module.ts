import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import {  RefreshStrategy } from './refresh.strategy';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuditModule } from '../audit/audit.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    AuditModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRATION || '900') },
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
