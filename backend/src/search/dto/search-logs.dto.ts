import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsIP,
  IsInt,
  IsDate,
  IsNotEmpty,
  Min,
  IsDateString,
} from 'class-validator';
import { FirewallType } from "src/logs/enums/firewall-type.enum";
import { FirewallLog } from 'src/logs/interfaces/firewall-log.interface';

export class SearchLogsDto {
    @IsDate()
    @Type(() => Date)
    timestamp: Date;
  
    @IsString()
    @IsNotEmpty()
    action: string; // ALLOW / DROP
  
    @IsString()
    @IsNotEmpty()
    protocol: string; // TCP / UDP / ICMP
  
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

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
    
    @IsOptional()
    @IsDateString()
    from?: string; 

    @IsOptional()
    @IsDateString()
    to?: string; 
}
