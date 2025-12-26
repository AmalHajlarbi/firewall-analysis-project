import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Logs {
  private apiUrl = 'http://localhost:3000/logs';
  private searchUrl = `${this.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  uploadLogs(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  searchLogs(dto: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(dto).forEach((key) => {
      if (dto[key] !== undefined && dto[key] !== '') {
        params = params.set(key, dto[key]);
      }
    });
    return this.http.get(this.searchUrl, { params });
  }
}
