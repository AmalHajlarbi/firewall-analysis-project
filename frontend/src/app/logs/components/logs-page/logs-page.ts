
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Logs } from '../../services/logs';
import { FirewallType } from '../../enums/FirewallType.enum';
import { UploadResponse,LogFilters, FirewallLog } from '../../interfaces/Firewall.interfaces';
import { Reports } from '../../../reports/services/reports';
import { ChangeDetectorRef } from '@angular/core';
import { computeVisiblePages,downloadBlob } from '../../../shared/utils/fcts.util';
import { Filter  } from '../../../filters/filter';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs-page.html',
  styleUrls: ['./logs-page.css'],
})
export class LogsPage implements OnInit {
  logs = signal<FirewallLog[]>([]);
  page = signal(1);
  limit = signal(20);
  total = signal(0);


  selectedFile!: File | null;
  firewallType: FirewallType | null = null;
  supportedTypes: FirewallType[] = [];
  isUploading = signal(false);
  uploadResult = signal<UploadResponse | undefined>(undefined)
  errorMessage = signal<string | undefined>(undefined);


  filters: LogFilters = {
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



  constructor(private logService: Logs, private reportsService: Reports, private cdr: ChangeDetectorRef,private filterService: Filter) {}

  ngOnInit() {
    this.loadSupportedFirewallTypes();
    this.loadLogs(); 
  }

  
   totalPages = computed(() =>
    Math.ceil(this.total() / this.limit())
  );

  visiblePages = computed(() =>
    computeVisiblePages(this.page(), this.totalPages())
  );
  loadLogs() {
    this.logService
      .searchLogs(this.page(), this.limit(), this.filters)
      .subscribe({
        next: res => {
          this.logs.set(res.data);
          this.total.set(res.total);
        },
        error: err => this.errorMessage.set(err.message),
      });
  }

  search() {
    this.page.set(1);
    this.loadLogs();
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadLogs();
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('Fichier > 10 Mo');
      return;
    }

    if (!file.name.match(/\.(log|txt)$/)) {
      this.errorMessage.set('Invalid format (.log / .txt)');
      return;
    }

    this.selectedFile = file;
    this.errorMessage.set(undefined);
  }

  uploadLogs() {
    if (!this.selectedFile || !this.firewallType) {
      this.errorMessage.set('File or firewall missing');
      return;
    }

    this.isUploading.set(true);

    this.logService.uploadLog(this.selectedFile, this.firewallType)
      .subscribe({
        next: res => {
          this.uploadResult.set(res);
          this.isUploading.set(false);
          this.page.set(1);
          this.loadLogs();
        },
        error: err => {
          this.errorMessage.set(err.message);
          this.isUploading.set(false);
        }
      });
  }


  loadSupportedFirewallTypes() {
    this.logService.getSupportedFirewallTypes()
      .subscribe({
        next: types => this.supportedTypes = types,
        error: err => this.errorMessage.set(err.message),
      });
  }


  downloadLogs(format: 'csv' | 'pdf') {
    this.reportsService.exportLogs(format, this.filters)
      .subscribe(blob => downloadBlob(blob, `logs.${format}`));
  }
  applyFilters() {
  // Met à jour le service avec les filtres choisis
  this.filterService.setFilters(this.filters);

  // Recharge les logs
  this.page.set(1);
  this.loadLogs();
}
}