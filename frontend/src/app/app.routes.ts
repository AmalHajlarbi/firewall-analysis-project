import { Routes } from '@angular/router';
import { LogsPage } from './logs/components/logs-page/logs-page';
import { DashboardPage } from './dashboard/components/dashboard-page/dashboard-page';

export const routes: Routes = [
  { path: 'logs', component: LogsPage },
  { path: 'dashboard', component: DashboardPage },
  { path: '', redirectTo: 'logs', pathMatch: 'full' }
];
