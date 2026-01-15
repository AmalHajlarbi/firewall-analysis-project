import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Logs, FirewallType, UploadResponse } from '../../services/logs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs-page.html',
  styleUrls: ['./logs-page.css'],
})
export class LogsPage implements OnInit {
  logs: any[] = [];
  total = 0;
  page = 1;
  limit = 20;

  // Upload
  selectedFile!: File | null;
  firewallType: FirewallType | null = null;
  supportedTypes: FirewallType[] = [];
  uploadResult?: UploadResponse;
  errorMessage?: string;
  isUploading = false;

  // Filtres (optionnel pour loadLogs)
  filters = {
    search: '',
    action: '',
    protocol: '',
    src_ip: '',
    dest_ip: '',
    from: '',
    to: '',
  };

  constructor(private logService: Logs, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSupportedFirewallTypes();
    this.loadLogs(); // si backend supporte pagination + filtres
  }

  trackById(index: number, log: any) {
    return log.id;
  }

  // --- Gestion du fichier sélectionné ---
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10 Mo max
      this.errorMessage = 'Le fichier dépasse la taille maximale de 10 Mo.';
      this.selectedFile = null;
    } else {
      this.selectedFile = file;
      this.errorMessage = undefined;
    }
  }

  // --- Upload du fichier ---
  uploadLogs() {
  if (!this.selectedFile || !this.firewallType) {
    this.errorMessage = 'Veuillez sélectionner un fichier et un type de firewall.';
    return;
  }

  this.isUploading = true;
  this.uploadResult = undefined;
  this.errorMessage = undefined;

  this.logService.uploadLog(this.selectedFile, this.firewallType).subscribe({
    next: (res) => {
      this.uploadResult = res;
      this.isUploading = false;
      console.log('isUploading =', this.isUploading, 'firewallType =', this.firewallType, 'selectedFile =', this.selectedFile);

      this.cdr.detectChanges(); // force Angular à mettre à jour le template
      this.loadLogs();
    },
    error: (err) => {
      this.errorMessage = err.error?.message || 'Erreur lors de l’upload.';
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  });
}

  // --- Charger types de firewall ---
  loadSupportedFirewallTypes() {
    this.logService.getSupportedFirewallTypes().subscribe({
      next: (types) => {
        console.log('Types reçus du backend:', types);
        this.supportedTypes = types;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Impossible de récupérer les types de firewall.';
      }
    });
  }

  // --- Pagination / filtres (optionnel) ---
  getTotalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  loadLogs() {
    // TODO : appeler le backend pour récupérer les logs avec filtres
    // Exemple :
    // this.logService.getLogs(this.page, this.limit, this.filters).subscribe(...)
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
