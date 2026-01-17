
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
newLogIds: number[] = []; // IDs des logs uploadés



  constructor(private logService: Logs, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
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
    } 
    else if (!file.name.endsWith('.log') && !file.name.endsWith('.txt')) {
  this.errorMessage = 'Format de fichier invalide. Seuls les fichiers .log ou .txt sont acceptés.';
  this.selectedFile = null;
}
    else {
      this.selectedFile = file;
      this.errorMessage = undefined;
    }
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
    next: (res: any) => {
      this.uploadResult = res;
      this.isUploading = false;

      // Recharger la première page
      this.page = 1;
      this.loadLogs();

      // Stocker les IDs des logs uploadés pour le surlignage persistant
      this.logService.searchLogs({ page: 1, limit: this.limit }).subscribe({
        next: (logsRes: any) => {
          const uploadedIds = logsRes.data.slice(0, res.linesProcessed).map((l: any) => l.id);
          this.newLogIds.push(...uploadedIds);
        }
      });
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
  const params: any = {
    page: this.page,
    limit: this.limit,
  };

  // Ajouter seulement les filtres non vides
  Object.keys(this.filters).forEach(key => {
    const value = (this.filters as any)[key];
    if (value) params[key] = value;
  });

  this.logService.searchLogs(params).subscribe({
    next: (res: any) => {
      // Marquer isNew si l'ID est dans newLogIds
      this.logs = res.data.map((log: any) => ({
        ...log,
        isNew: this.newLogIds.includes(log.id)
      }));

      this.total = Number(res.total);
      this.page = Number(res.page);
      this.limit = Number(res.limit);

      this.cdr.detectChanges();
    },
    error: () => {
      this.errorMessage = 'Erreur lors du chargement des logs.';
    }
  });
}




  search() {
  this.page = 1;
  this.loadLogs();
}

changePage(p: number) {
  this.page = p;
  this.loadLogs();
}



}