import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';

// Standalone components (import, don't declare)
import { LayoutComponent } from './components/layout/layout';
import { OverviewComponent } from './components/overview/overview';
import { UsersListComponent } from './users/components/users-list/users-list';
import { UserCreateComponent } from './users/components/user-create/user-create';
import { UserDetailsComponent } from './users/components/user-details/user-details';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,

    LayoutComponent,
    OverviewComponent,
    UsersListComponent,
    UserCreateComponent,
    UserDetailsComponent,
  ],
})
export class AdminModule {}
