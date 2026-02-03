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
  constructor() {
    // Charger depuis localStorage au démarrage
    const savedTypes = localStorage.getItem('supportedFirewallTypes');
    if (savedTypes) {
      this.supportedFirewallTypes.set(JSON.parse(savedTypes));
    }
  }
  
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
      direction: '',
      from: '',
      to: ''
    };
    this.setFilters(emptyFilters);
  }
  supportedFirewallTypes = signal<FirewallType[]>([]);
  setSupportedFirewallTypes(types: FirewallType[]) {
    this.supportedFirewallTypes.set(types);
    localStorage.setItem('supportedFirewallTypes', JSON.stringify(types));
  }
  
  
}
