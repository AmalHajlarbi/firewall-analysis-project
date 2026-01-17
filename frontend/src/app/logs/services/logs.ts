
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum FirewallType {
  //WINDOWS_DEFENDER = 'WINDOWS_DEFENDER',
  //FORTIGATE = 'FORTIGATE',
  // Ajouter d'autres types plus tard
}

export interface UploadResponse {
  message: string;
  linesProcessed: number;
  linesIgnored: number;
  warning?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Logs {
  private apiUrl = 'http://localhost:3000/logs';

  constructor(private http: HttpClient) {}

  uploadLog(file: File, firewallType: FirewallType): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('firewallType', firewallType.toString()); 
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getSupportedFirewallTypes(): Observable<FirewallType[]> {
    return this.http.get<FirewallType[]>(`${this.apiUrl}/supported-types`);
  }
  searchLogs(params: any): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/search`, { params });
}

}