import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService } from '../../services/admin-users';
import { AdminUser } from '../../interfaces/admin.interfaces';
import { UserRole } from '../../enums/user-role.enum';


@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css'],
})
export class OverviewComponent implements OnInit {
  loading = true;
  error = '';

  // totals
  totalUsers = 0;

  // roles
  admins = 0;
  analysts = 0;

  // status
  activeUsers = 0;
  inactiveUsers = 0;

  // lock state
  blockedUsers = 0;
  unblockedUsers = 0;

  constructor(private usersService: AdminUsersService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    // We fetch a large page to compute stats client-side
    this.usersService.getUsers(1, 1000).subscribe({
      next: (res) => {
        const users = res.users as AdminUser[];

        this.totalUsers = res.total;

        // roles
        this.admins = users.filter(u => u.role === UserRole.ADMIN).length;
        this.analysts = users.filter(u => u.role === UserRole.ANALYST).length;


        // active / inactive
        this.activeUsers = users.filter(u => u.isActive).length;
        this.inactiveUsers = users.filter(u => !u.isActive).length;

        // blocked / unblocked
        this.blockedUsers = users.filter(u => this.isBlocked(u)).length;
        this.unblockedUsers = users.length - this.blockedUsers;

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load overview';
        this.loading = false;
      },
    });
  }

  // same logic as users list
  isBlocked(u: AdminUser): boolean {
    if (!u.lockedUntil) return false;
    return new Date(u.lockedUntil).getTime() > Date.now();
  }
}
