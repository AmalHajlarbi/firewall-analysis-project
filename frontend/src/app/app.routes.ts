import { Routes } from '@angular/router';
import { LogsPage } from './logs/components/logs-page/logs-page';
import { DashboardPage } from './dashboard/components/dashboard-page/dashboard-page';
import { UploadPage } from './upload/components/upload-page/upload-page';

export const routes: Routes = [
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: 'upload', component: UploadPage },
  { path: 'logs', component: LogsPage },
  { path: 'dashboard', component: DashboardPage },
  {path: '**', redirectTo: ''}
];
