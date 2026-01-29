
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FirewallType } from '../../upload/enums/FirewallType.enum';
import { LogsSearchResponse ,FirewallLog, LogFilters } from '../interfaces/Firewall.interfaces';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Logs {
  private apiUrl = 'http://localhost:3000/logs';
  

  constructor(private http: HttpClient) {}

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
): HttpParams {
  let params = new HttpParams()
    .set('page', page)
    .set('limit', limit);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params = params.set(key, value.toString());
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