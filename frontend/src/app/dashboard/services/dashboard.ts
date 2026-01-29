import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,map} from 'rxjs';
import { StatisticsResponse } from '../interfaces/statistics-response.interface';
import { AnomalyResponse } from '../interfaces/anomaly-response.interface';
import { ChartData } from 'chart.js';
import { CHART_COLORS } from '../../shared/constants/colors';


@Injectable({
  providedIn: 'root',
})

export class Dashboard {

  private baseUrl = 'http://localhost:3000/analysis';

  constructor(private http: HttpClient) {}

  getStatistics(filters: any = {}): Observable<{
    allowDenyData: ChartData<'bar'>;
    protocolData: ChartData<'bar'>;
    directionData: ChartData<'bar'>;
    firewallTypeData: ChartData<'bar'>;
    topSourceIpData: ChartData<'bar'>;
    topDestinationIpData: ChartData<'bar'>;
  }> {
    return this.http.get<StatisticsResponse>(`${this.baseUrl}/statistics`,{ params: filters }).pipe(
      map(stats => ({
        allowDenyData: {
          labels: stats.allowed !== undefined && stats.dropped !== undefined ? ['Allowed', 'Dropped'] : [],
          datasets: [{
            data: [Number(stats.allowed), Number(stats.dropped)],
            backgroundColor: CHART_COLORS.allowDeny
          }]
        },
        protocolData: {
          labels: stats.byProtocol.map((p: { label: string; count: number }) => p.label),
          datasets: [{
            data: stats.byProtocol.map((p: { label: string; count: number }) => Number(p.count)),
            backgroundColor: CHART_COLORS.protocol
          }]
        },
        directionData: {
          labels: stats.byDirection.map((d: { label?: string; count: number }) => d.label ?? 'Unknown Direction'),
          datasets: [{
            data: stats.byDirection.map((d: { label?: string; count: number }) => Number(d.count)),
            backgroundColor: CHART_COLORS.direction
          }]
        },
        firewallTypeData: {
          labels: stats.byFirewallType.map((f: { label: string; count: number }) => f.label),
          datasets: [{
            data: stats.byFirewallType.map((f: { label: string; count: number }) => Number(f.count)),
            backgroundColor: CHART_COLORS.firewallType
          }]
        },
        topSourceIpData: {
          labels: stats.topSourceIp.map((ip: { label: string; count: number }) => ip.label),
          datasets: [{
            data: stats.topSourceIp.map((ip: { label: string; count: number }) => Number(ip.count)),
            backgroundColor: CHART_COLORS.topSourceIp
          }]
        },
        topDestinationIpData: {
          labels: stats.topDestinationIp.map((ip: { label: string; count: number }) => ip.label),
          datasets: [{
            data: stats.topDestinationIp.map((ip: { label: string; count: number }) => Number(ip.count)),
            backgroundColor: CHART_COLORS.topDestinationIp
          }]
        }
      }))
    );
  }

  getAnomalies(filters: any = {}): Observable<AnomalyResponse> {
    return this.http.get<AnomalyResponse>(`${this.baseUrl}/anomalies`, { params: filters });
  }

  
}
