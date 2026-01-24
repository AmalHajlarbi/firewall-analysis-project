import { Injectable, signal } from '@angular/core';
import { LogFilters } from '../logs/interfaces/Firewall.interfaces';
@Injectable({
  providedIn: 'root',
})
export class Filter {
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
    to: ''
  });

  setFilters(newFilters: Partial<LogFilters>) {
    this.filters.set({ ...this.filters(), ...newFilters });
  }
  
}
