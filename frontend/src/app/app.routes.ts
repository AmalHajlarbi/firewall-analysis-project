import { Routes } from '@angular/router';
import { LogsPage } from './logs/components/logs-page/logs-page';
import { DashboardPage } from './dashboard/components/dashboard-page/dashboard-page';
import { UploadPage } from './upload/components/upload-page/upload-page';

import { LoginPageComponent } from './auth/components/login-page/login';
import { RegisterPageComponent } from './auth/components/register-page/register';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'upload', component: UploadPage, canActivate: [AuthGuard] },
  { path: 'logs', component: LogsPage, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardPage, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },

  {path: '**', redirectTo: ''}
];
