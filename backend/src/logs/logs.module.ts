import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallLogEntity } from './entities/firewall-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FirewallLogEntity])],
  providers: [LogsService],
  controllers: [LogsController],
  exports: [LogsService], // si d’autres modules ont besoin
})
export class LogsModule {}
