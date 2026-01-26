
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Logs } from '../../services/logs';
import { FirewallType } from '../../../upload/enums/FirewallType.enum';
import { LogFilters, FirewallLog } from '../../interfaces/Firewall.interfaces';
import { Reports } from '../../../reports/services/reports';
import { ChangeDetectorRef } from '@angular/core';
import { computeVisiblePages,downloadBlob } from '../../../shared/utils/fcts.util';
import { ActivatedRoute } from '@angular/router';
import { Store} from '../../../store/store';


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
  supportedTypes: FirewallType[] = [];
  errorMessage = signal<string | undefined>(undefined);
  constructor(private logService: Logs, private reportsService: Reports, private cdr: ChangeDetectorRef,public store: Store, private route: ActivatedRoute) {}

  ngOnInit() {
  this.route.queryParams.subscribe(params => {
    console.log('Query params:', params);

    // Priorité aux query params
    const fileId = params['fileId'] ?? this.store.filters().fileId ?? localStorage.getItem('lastFileId') ?? '';


    if (!fileId) {
      console.warn('No fileId available. Cannot load logs.');
      return;
    }

    // Mettre à jour le service Filter
    this.store.setFilters({ fileId });
    this.page.set(1);
    this.loadLogs();
  });
}

  
   totalPages = computed(() =>
    Math.ceil(this.total() / this.limit())
  );

  visiblePages = computed(() =>
    computeVisiblePages(this.page(), this.totalPages())
  );
  
  loadLogs() {
    const filters = this.store.filters();

  if (!filters.fileId) {
    console.warn('fileId filter is required to load logs.');
    return; 
  }

  this.logService
    .searchLogs(this.page(), this.limit(), this.store.filters())
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
  downloadLogs(format: 'csv' | 'pdf') {
    this.reportsService.exportLogs(format, this.store.filters())
      .subscribe(blob => downloadBlob(blob, `logs.${format}`));
  }
}