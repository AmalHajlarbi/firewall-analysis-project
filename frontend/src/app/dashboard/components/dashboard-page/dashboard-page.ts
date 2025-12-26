import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard } from '../../services/dashboard';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';


@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {

  allowDenyData!: ChartData<'pie'>;
  protocolData!: ChartData<'bar'>;

  constructor(private dashboardService: Dashboard) {}

  ngOnInit(): void {
    this.dashboardService.getStatistics().subscribe(stats => {

      this.allowDenyData = {
        labels: ['ALLOW', 'DENY'],
        datasets: [
          { data: [stats.allowed, stats.denied] }
        ]
      };

      this.protocolData = {
        labels: stats.byProtocol.map((p: any) => p.protocol),
        datasets: [
          {
            label: 'Nombre de logs',
            data: stats.byProtocol.map((p: any) => p.count)
          }
        ]
      };
    });
  }
}