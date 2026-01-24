import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Dashboard } from '../../services/dashboard';
import { PieChart } from '../pie-chart/pie-chart';
import { BarChart} from '../bar-chart/bar-chart';
import { ChartData, ChartOptions } from 'chart.js';
import { Reports } from '../../../reports/services/reports';
import { downloadBlob } from '../../../shared/utils/fcts.util';



@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, NgChartsModule, PieChart, BarChart],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css']
})
export class DashboardPage implements OnInit {

  allowDenyData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  protocolData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  directionData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  firewallTypeData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  topSourceIpData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };
  topDestinationIpData: ChartData<'bar'> = { labels: [], datasets: [{ data: [] }] };

  pieOptions: ChartOptions<'pie'> = { responsive: true, plugins: { legend: { position: 'top' } } };
  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false }, datalabels: { color: '#000' } },
    scales: { x: { title: { display: true } }, y: { beginAtZero: true } }
  };

  anomalies = signal<any[]>([]);

  constructor(private dashboardService: Dashboard,  private reportsService: Reports) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadAnomalies();
  }
  
loadStatistics() {
  this.dashboardService.getStatistics().subscribe(stats => {
    this.allowDenyData = stats.allowDenyData;
    this.protocolData = stats.protocolData;
    this.directionData = stats.directionData;
    this.firewallTypeData = stats.firewallTypeData;
    this.topSourceIpData = stats.topSourceIpData;
    this.topDestinationIpData = stats.topDestinationIpData;
  });
}

  loadAnomalies() {
    this.dashboardService.getAnomalies().subscribe(res => {
      this.anomalies.set(res.anomalies);
    });
  }
  
downloadAnalysis(format: 'csv' | 'pdf') {
    const filters = {};
    this.reportsService.exportAnalysis(format, filters)
      .subscribe(blob => downloadBlob(blob, `logs.${format}`));
  }

}
