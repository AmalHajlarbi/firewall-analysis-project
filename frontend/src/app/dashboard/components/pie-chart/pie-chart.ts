import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NgChartsModule } from 'ng2-charts';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './pie-chart.html',
  styleUrl: './pie-chart.css',
})
export class PieChart implements OnInit {
  @Input() data!: ChartData<'pie'>;
  @Input() options!: ChartOptions<'pie'>;

  ngOnInit(): void {
    if (!this.options.plugins) this.options.plugins = {};
    if (!this.options.plugins['datalabels']) {
      this.options.plugins['datalabels'] = {
        color: '#fff',
        formatter: (value: any) => value
      };
    }
  }
}
