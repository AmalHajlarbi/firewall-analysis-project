import { IsEnum } from 'class-validator';
import { FirewallType } from '../enums/firewall-type.enum';

export class UploadLogDto {
  @IsEnum(FirewallType, {
    message: 'firewallType doit être une valeur valide (WINDOWS_DEFENDER, FORTIGATE, ...)',
  })
  firewallType: FirewallType;
}