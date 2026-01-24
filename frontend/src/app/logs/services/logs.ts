
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirewallType } from '../enums/FirewallType.enum';
import { UploadResponse,LogsSearchResponse ,FirewallLog, LogFilters } from '../interfaces/Firewall.interfaces';
import { Observable, catchError, throwError } from 'rxjs';

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
    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData)
    .pipe(catchError(this.handleError));;
  }

  getSupportedFirewallTypes(): Observable<FirewallType[]> {
    return this.http.get<FirewallType[]>(`${this.apiUrl}/supported-types`)
    .pipe(catchError(this.handleError));;
  }
  searchLogs(
    page: number,
    limit: number,
    filters: LogFilters
  ): Observable<LogsSearchResponse> {
    const params = this.buildSearchParams(page, limit, filters);

    return this.http
      .get<LogsSearchResponse>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }
  private buildSearchParams(
    page: number,
    limit: number,
    filters: LogFilters
  ): any {
    const params: any = { page, limit };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value;
      }
    });

    return params;
  }
  private handleError(error: any) {
    console.error('[LogsService]', error);
    return throwError(() =>
      new Error(error?.error?.message || 'Erreur serveur')
    );
  }
  exportLogs(format: 'csv' | 'pdf', filters: LogFilters): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: { ...filters, format },
      responseType: 'blob'  
    });
  }
}