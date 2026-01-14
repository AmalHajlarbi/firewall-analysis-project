import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsIP,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FirewallType } from '../enums/firewall-type.enum';

export class ParsedLogDto {
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  protocol: string;

  @IsIP()
  sourceIp: string;

  @IsOptional()
  @IsInt()
  sourcePort?: number;

  @IsIP()
  destinationIp: string;

  @IsOptional()
  @IsInt()
  destinationPort?: number;

  @IsOptional()
  @IsString()
  direction?: string;

  @IsEnum(FirewallType)
  firewallType: FirewallType;

  @IsString()
  @IsNotEmpty()
  rawLog: string;
}
