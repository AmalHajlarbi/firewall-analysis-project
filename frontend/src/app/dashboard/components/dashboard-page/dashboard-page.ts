import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Dashboard } from '../../services/dashboard';
import { BarChart } from '../bar-chart/bar-chart';
import { ChartData, ChartOptions } from 'chart.js';
import { Reports } from '../../../reports/services/reports';
import { downloadBlob } from '../../../shared/utils/fcts.util';
import { signal,effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store} from '../../../store/store';


@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, NgChartsModule, BarChart],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css']
})
export class DashboardPage implements OnInit {
  
  
  allowDenyData = signal<ChartData<'bar'>>({ labels: [], datasets: [{ data: [] }] });
  protocolData = signal<ChartData<'bar'>>({ labels: [], datasets: [{ data: [] }] });
  directionData = signal<ChartData<'bar'>>({ labels: [], datasets: [{ data: [] }] });
  firewallTypeData = signal<ChartData<'bar'>>({ labels: [], datasets: [{ data: [] }] });
  topSourceIpData = signal<ChartData<'bar'>>({ labels: [], datasets: [{ data: [] }] });
  topDestinationIpData = signal<ChartData<'bar'>>({ labels: [], datasets: [{ data: [] }] });

  //pieOptions: ChartOptions<'pie'> = { responsive: true, plugins: { legend: { position: 'top' } } };
  barOptions: ChartOptions<'bar'> = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

  anomalies = signal<any[]>([]);

  constructor(
    private dashboardService: Dashboard,
    private reportsService: Reports,
    private store: Store,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    
    this.loadStatistics(this.store.filters());
    this.loadAnomalies(this.store.filters());
    
  }

  loadStatistics(filters: any = {}) {
    this.dashboardService.getStatistics(filters).subscribe({
      next: stats => {
        this.allowDenyData.set(stats.allowDenyData);
        this.protocolData.set(stats.protocolData);
        this.directionData.set(stats.directionData);
        this.firewallTypeData.set(stats.firewallTypeData);
        this.topSourceIpData.set(stats.topSourceIpData);
        this.topDestinationIpData.set(stats.topDestinationIpData);
      },
      error: err => console.error('Erreur statistiques:', err)
    });
  }

  loadAnomalies(filters: any = {}) {
    this.dashboardService.getAnomalies(filters).subscribe({
      next: res => this.anomalies.set(res.anomalies ?? []),
      error: err => console.error('Erreur anomalies:', err)
    });
  }

  downloadAnalysis(format: 'csv' | 'pdf') {
    const filters = this.store.filters();
    this.reportsService.exportAnalysis(format, filters)
      .subscribe(blob => downloadBlob(blob, `logs.${format}`));
  }
}
