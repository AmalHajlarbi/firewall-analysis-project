import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { FirewallType } from 'src/logs/enums/firewall-type.enum';

export class AnalysisFilterDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  protocol?: string;

  @IsOptional()
  @IsEnum(FirewallType)
  firewallType?: FirewallType;

  @IsOptional()
  @IsString()
  direction?: string;

}
