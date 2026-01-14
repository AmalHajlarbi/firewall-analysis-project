import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsIP, IsOptional, IsString, Min } from "class-validator";
import { FirewallType } from "src/logs/enums/firewall-type.enum";
import { FirewallLog } from "src/logs/interfaces/firewall-log.interface";

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(FirewallType)
  firewallType?: FirewallType;

  @IsOptional()
  @IsIP()
  sourceIp?: string;

  @IsOptional()
  @IsIP()
  destinationIp?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  direction?: string;

  @IsOptional()
  @IsString()
  format?: 'csv' | 'pdf';
}
