import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';

import { LayoutComponent } from './components/layout/layout';
import { OverviewComponent } from './components/overview/overview';
import { UsersListComponent } from './users/components/users-list/users-list';
import { UserCreateComponent } from './users/components/user-create/user-create';
import { UserDetailsComponent } from './users/components/user-details/user-details';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard], 
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },

      { path: 'overview', component: OverviewComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'users/create', component: UserCreateComponent },
      { path: 'users/:id', component: UserDetailsComponent },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
