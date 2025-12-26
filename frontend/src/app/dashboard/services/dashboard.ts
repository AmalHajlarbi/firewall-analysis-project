import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private apiUrl = 'http://localhost:3000/analysis';

  constructor(private http: HttpClient) {}

  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }

  getAnomalies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/anomalies`);
  }
  
}
