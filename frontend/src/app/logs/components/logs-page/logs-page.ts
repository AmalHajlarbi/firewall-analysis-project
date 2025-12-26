import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Logs } from '../../services/logs';

@Component({
  selector: 'app-logs-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './logs-page.html',
  styleUrls: ['./logs-page.css'],
})
export class LogsPage implements OnInit {
  logs: any[] = [];
  total = 0;
  page = 1;
  limit = 20;

  selectedFile!: File;

  filters = {
    search: '',
    action: '',
    protocol: '',
    src_ip: '',
    dest_ip: '',
    from: '',
    to: '',
  };

  constructor(private logsService: Logs) {}

  ngOnInit(): void {
    this.loadLogs();
  }
  trackById(index: number, log: any) {
  return log.id;
}


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadLogs() {
    if (!this.selectedFile) return;
    this.logsService.uploadLogs(this.selectedFile).subscribe(() => {
      this.loadLogs();
    });
  }

  loadLogs() {
    const dto: any = {
      action: this.filters.action || undefined,
      protocol: this.filters.protocol || undefined,
      src_ip: this.filters.src_ip || undefined,
      dest_ip: this.filters.dest_ip || undefined,
      from: this.filters.from || undefined,
      to: this.filters.to || undefined,
      page: this.page,
      limit: this.limit,
    };

    this.logsService.searchLogs(dto).subscribe((res: any) => {
      this.logs = res.data;
      this.total = res.total;
    });
  }

  search() {
  this.page = 1;
  this.loadLogs();
}


  changePage(newPage: number) {
    this.page = newPage;
    this.loadLogs();
  }
}
