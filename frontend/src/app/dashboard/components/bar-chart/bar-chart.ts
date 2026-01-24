import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NgChartsModule } from 'ng2-charts';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.css',
})
export class BarChart {
  @Input() data!: ChartData<'bar'>;
  @Input() options!: ChartOptions<'bar'>;
}
