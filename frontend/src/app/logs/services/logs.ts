import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum FirewallType {
  WINDOWS_DEFENDER = 'WINDOWS_DEFENDER',
  FORTIGATE = 'FORTIGATE'
  // Ajouter d'autres types supportés si nécessaire
}

export interface UploadResponse {
  processed: number;
  ignored: number;
  warning?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class Logs{

  private apiUrl = 'http://localhost:3000/logs'; // URL du backend

  constructor(private http: HttpClient) {}

  /**
   * Upload d'un fichier de logs avec le type de firewall choisi
   */
  uploadLog(file: File, firewallType: FirewallType): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('firewallType', firewallType);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Récupère la liste des types de firewall supportés par le backend
   */
  getSupportedFirewallTypes(): Observable<FirewallType[]> {
    return this.http.get<FirewallType[]>(`${this.apiUrl}/supported-types`);
  }
}
