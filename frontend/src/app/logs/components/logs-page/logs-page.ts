import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Logs,FirewallType, UploadResponse } from '../../services/logs';

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

  // Upload
  selectedFile!: File | null;
  firewallType: FirewallType | null = null;
  supportedTypes: FirewallType[] = [];
  uploadResult?: UploadResponse;
  errorMessage?: string;
  isUploading = false;

  // Filtres
  filters = {
    search: '',
    action: '',
    protocol: '',
    src_ip: '',
    dest_ip: '',
    from: '',
    to: '',
  };

  constructor(private logService: Logs) {}

  ngOnInit(): void {
    this.loadLogs();
    this.loadSupportedFirewallTypes();
  }

  trackById(index: number, log: any) {
    return log.id;
  }

  // --- Upload logs ---
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10 Mo max
        this.errorMessage = 'Le fichier dépasse la taille maximale de 10 Mo.';
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
        this.errorMessage = undefined;
      }
    }
  }

  onFirewallTypeSelected(event: any) {
    this.firewallType = event.target.value as FirewallType;
  }
  // Ajouter cette méthode
getTotalPages(): number {
  return Math.ceil(this.total / this.limit);
}


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
        this.loadLogs(); // recharger les logs après upload
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'upload.';
        this.isUploading = false;
      }
    });
  }

  loadSupportedFirewallTypes() {
    this.logService.getSupportedFirewallTypes().subscribe({
      next: (types) => this.supportedTypes = types,
      error: () => this.errorMessage = 'Impossible de récupérer les types de firewall.'
    });
  }

  // --- Recherche et pagination ---
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

    // Ici tu peux adapter si ton backend supporte les query params
    // Exemple avec GET + query params ou POST selon ton API
    // On garde l'ancien service searchLogs si besoin
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
