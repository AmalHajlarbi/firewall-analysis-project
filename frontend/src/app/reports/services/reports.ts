import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Reports {
  private baseUrl = 'http://localhost:3000/reports';

  constructor(private http: HttpClient) {}

  getFilteredLogs(filters: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(k => { if (filters[k]) params = params.set(k, filters[k]); });
    return this.http.get(`${this.baseUrl}/logsbruts/csv`, { params }); // ou endpoint JSON si existant
  }

  exportLogs(format: 'csv' | 'pdf', filters: any) {
    let params = new HttpParams();
    Object.keys(filters).forEach(k => { if (filters[k]) params = params.set(k, filters[k]); });
    return this.http.get(`${this.baseUrl}/logsbruts/${format}`, {
      params,
      responseType: 'blob'
    });
  }

  exportAnalysis(format: 'csv' | 'pdf', filters: any) {
    let params = new HttpParams().set('format', format);
    Object.keys(filters).forEach(k => { if (filters[k]) params = params.set(k, filters[k]); });
    return this.http.get(`${this.baseUrl}/analysis`, {
      params,
      responseType: 'blob'
    });
  }
}
