import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatisticsResponse } from '../interfaces/statistics-response.interface';
import { AnomalyResponse } from '../interfaces/anomaly-response.interface';

@Injectable({
  providedIn: 'root',
})

export class Dashboard {

  private baseUrl = 'http://localhost:3000/analysis';

  constructor(private http: HttpClient) {}

  getStatistics(filters: any = {}): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.baseUrl}/statistics`, { params: filters });
  }

  getAnomalies(filters: any = {}): Observable<AnomalyResponse> {
    return this.http.get<AnomalyResponse>(`${this.baseUrl}/anomalies`, { params: filters });
  }
}
