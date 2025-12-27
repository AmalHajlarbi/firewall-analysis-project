import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAudit } from './entities/authaudit.entity';
import { AuthAuditService } from './authaudit.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuthAudit]),
  ],
  providers: [AuthAuditService],
  exports: [AuthAuditService],
})
export class AuthAuditModule {}