import { Component, OnInit } from '@angular/core';
import { Dashboard } from '../../services/dashboard';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ChangeDetectorRef } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Reports } from '../../../reports/services/reports';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css']
})
export class DashboardPage implements OnInit {

  // Chart Data
  allowDenyData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  protocolData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  directionData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  firewallTypeData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  topSourceIpData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  topDestinationIpData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };

  // Chart Options
  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } }
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { title: { display: true } }, y: { beginAtZero: true } }
  };

  anomalies: any[] = [];

  constructor(private dashboardService: Dashboard, private cdr: ChangeDetectorRef, private reportsService: Reports) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadAnomalies();
  }

  loadStatistics() {
    this.dashboardService.getStatistics().subscribe(stats => {

      this.allowDenyData = {
        labels: ['Allowed', 'Dropped'],
        datasets: [{ data: [Number(stats.allowed), Number(stats.droped)], backgroundColor: ['#28a745', '#dc3545'] }]
      };

      this.protocolData = {
        labels: stats.byProtocol.map(p => p.label),
        datasets: [{ data: stats.byProtocol.map(p => Number(p.count)), backgroundColor: '#007bff' }]
      };

      this.directionData = {
        labels: stats.byDirection.map(d => d.label ?? 'Unknown'),
        datasets: [{ data: stats.byDirection.map(d => Number(d.count)), backgroundColor: '#17a2b8' }]
      };

      this.firewallTypeData = {
        labels: stats.byFirewallType.map(f => f.label),
        datasets: [{ data: stats.byFirewallType.map(f => Number(f.count)), backgroundColor: '#ffc107' }]
      };

      this.topSourceIpData = {
        labels: stats.topSourceIp.map(ip => ip.label),
        datasets: [{ data: stats.topSourceIp.map(ip => Number(ip.count)), backgroundColor: '#6f42c1' }]
      };

      this.topDestinationIpData = {
        labels: stats.topDestinationIp.map(ip => ip.label),
        datasets: [{ data: stats.topDestinationIp.map(ip => Number(ip.count)), backgroundColor: '#fd7e14' }]
      };

      this.cdr.detectChanges();
    });
  }

  loadAnomalies() {
    this.dashboardService.getAnomalies().subscribe(res => {
      this.anomalies = res.anomalies;
      this.cdr.detectChanges();
    });
  }
  exportAnalysis(format: 'csv' | 'pdf') {
  const filters = {}; // ajouter filtres si nécessaire
  this.reportsService.exportAnalysis(format, filters).subscribe(blob => {
    const file = new Blob([blob], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
    const url = window.URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

}
