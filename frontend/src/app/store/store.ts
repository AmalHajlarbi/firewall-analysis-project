import { Injectable, signal } from '@angular/core';
import { LogFilters } from '../logs/interfaces/Firewall.interfaces';
import { FirewallType } from '../upload/enums/FirewallType.enum';

@Injectable({
  providedIn: 'root',
})
export class Store {
  filters = signal<LogFilters>({
    action: '',
    protocol: '',
    sourceIp: '',
    destinationIp: '',
    sourcePort: '',
    destinationPort: '',
    firewallType: '',
    direction: '',
    from: '',
    to: '',
    fileId: '',
  });
  
  /*
setFilters(partial: Partial<LogFilters>) {
  console.log('Setting filters with partial:', partial);
  const normalized: Partial<LogFilters> = { ...partial };

  if (partial.from) {
    normalized.from = this.toIsoWithoutMs(partial.from);
  }

  if (partial.to) {
    normalized.to = this.toIsoWithoutMs(partial.to);
  }

  this.filters.set({
    ...this.filters(),
    ...normalized
  });
}

 toIsoWithoutMs(value: string): string {
  const d = new Date(value);
  return d.toISOString().split('.')[0]; // YYYY-MM-DDTHH:mm:ss
}
  
 private isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
*/
setFilters(partial: Partial<LogFilters>) {
  

  

  this.filters.set({
    ...this.filters(),
    ...partial
  });
}



  
  resetFilters() {
    const emptyFilters: LogFilters = {
      action: '',
      protocol: '',
      sourceIp: '',
      destinationIp: '',
      sourcePort: '',
      destinationPort: '',
      firewallType: '',
      direction: '',
      from: '',
      to: ''
    };
    this.setFilters(emptyFilters);
  }
  supportedFirewallTypes = signal<FirewallType[]>([]);
  setSupportedFirewallTypes(types: FirewallType[]) {
    this.supportedFirewallTypes.set(types);
  }
  
  
}
