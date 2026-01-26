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


export class SearchLogsDto {
  
    @IsOptional()
    @IsString()
    action: string; 
  
    @IsOptional()
    @IsString()
    protocol: string; 
  
    @IsOptional()
    @IsIP()
    sourceIp: string;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sourcePort?: number;
  
    @IsOptional()
    @IsIP()
    destinationIp: string;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    destinationPort?: number;
  
    @IsOptional()
    @IsString()
    direction?: string; 
  
    @IsOptional()
    @IsEnum(FirewallType)
    firewallType: FirewallType;
    
    @IsOptional()
    @IsDateString()
    from?: string; 

    @IsOptional()
    @IsDateString()
    to?: string; 

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

    @IsString()
    fileId: string;
}

