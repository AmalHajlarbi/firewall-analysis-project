import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';

import { LayoutComponent } from './components/layout/layout';
import { OverviewComponent } from './components/overview/overview';
import { UsersListComponent } from './users/components/users-list/users-list';
import { UserCreateComponent } from './users/components/user-create/user-create';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,

    LayoutComponent,
    OverviewComponent,
    UsersListComponent,
    UserCreateComponent,
  ],
})
export class AdminModule {}
