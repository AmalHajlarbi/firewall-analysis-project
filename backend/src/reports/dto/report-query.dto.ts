import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsIP, IsOptional, IsString, Min } from "class-validator";
import { FirewallType } from "src/logs/enums/firewall-type.enum";

export enum ReportFormat {
  CSV = 'csv',
  PDF = 'pdf',
}

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
  protocol: string; 

  @IsOptional()
  @IsString()
  direction?: string;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional()  
  @IsString()
  fileId: string;
}
