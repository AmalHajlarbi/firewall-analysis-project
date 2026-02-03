import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminUsersService } from '../../../services/admin-users';
import { AdminUser } from '../../../interfaces/admin.interfaces';
import { UserRole } from '../../../enums/user-role.enum';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
})
export class UsersListComponent implements OnInit {
  loading = true;
  error = '';

  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];

  page = 1;
  limit = 10;
  total = 0;
  lastPage = 1;

  roleFilter: UserRole | '' = '';
  search = '';
  activeFilter = '';   
  lockedFilter = '';   
  deletedFilter = '';  

  constructor(private usersService: AdminUsersService) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page = this.page): void {
    this.loading = true;
    this.error = '';

    this.usersService.getUsers(page, this.limit).subscribe({
      next: (res) => {
        this.users = res.users ?? [];
        this.total = res.total ?? 0;
        this.page = res.page ?? page;
        this.lastPage = res.lastPage ?? 1;

        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load users';
        this.loading = false;
      },
    });
  }

  isDeleted(u: AdminUser): boolean {
    return !!u.deletedAt;
  }

  isBlocked(u: AdminUser): boolean {
    if (!u.lockedUntil) return false;
    return new Date(u.lockedUntil).getTime() > Date.now();
  }

  statusText(u: AdminUser): string {
    return u.isActive ? 'Active' : 'Inactive';
  }

  blockedText(u: AdminUser): string {
    return this.isBlocked(u) ? 'Blocked' : 'Unblocked';
  }

  deletedText(u: AdminUser): string {
    return this.isDeleted(u) ? 'Deleted' : 'No';
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.search = '';
    this.roleFilter = '';
    this.activeFilter = '';
    this.lockedFilter = '';
    this.deletedFilter = '';
    this.applyFilters();
  }

  applyFilters(): void {
    const s = this.search.trim().toLowerCase();

    this.filteredUsers = this.users.filter((u) => {
      const matchesSearch =
        !s ||
        u.email?.toLowerCase().includes(s) ||
        u.username?.toLowerCase().includes(s);

      const matchesRole =
      !this.roleFilter || u.role === this.roleFilter

      const matchesActive =
        this.activeFilter === ''
          ? true
          : u.isActive === (this.activeFilter === 'true');

      const matchesLocked =
        this.lockedFilter === ''
          ? true
          : this.isBlocked(u) === (this.lockedFilter === 'true');

      const matchesDeleted =
        this.deletedFilter === ''
          ? true
          : this.isDeleted(u) === (this.deletedFilter === 'true');

      return (
        matchesSearch &&
        matchesRole &&
        matchesActive &&
        matchesLocked &&
        matchesDeleted
      );
    });
  }


  softDelete(u: AdminUser): void {
  if (!confirm(`Soft delete ${u.email}?`)) return;

  this.usersService.deleteUser(u.id).subscribe({
    next: () => {
      const now = new Date().toISOString();
      this.users = this.users.map(x =>
        x.id === u.id ? { ...x, deletedAt: now } : x
      );
      this.applyFilters();
    },
    error: (err) => (this.error = err?.error?.message || 'Delete failed'),
  });
}


restore(u: AdminUser): void {
  this.usersService.restoreUser(u.id).subscribe({
    next: () => {
      this.users = this.users.map(x =>
        x.id === u.id ? { ...x, deletedAt: null } : x
      );
      this.applyFilters();
    },
    error: (err) => (this.error = err?.error?.message || 'Restore failed'),
  });
}

  block(u: AdminUser): void {
    if (this.isDeleted(u)) return;

    const minutesRaw = prompt('Lock duration in minutes (default 15):', '15');
    const minutes = minutesRaw ? Number(minutesRaw) : 15;

    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 15;

    this.usersService.lockUser(u.id, safeMinutes).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.message || 'Block failed'),
    });
  }

  unblock(u: AdminUser): void {
    if (this.isDeleted(u)) return;

    this.usersService.unlockUser(u.id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.message || 'Unblock failed'),
    });
  }

  changePassword(u: AdminUser): void {
    if (this.isDeleted(u)) return;

    const newPassword = prompt(`New password for ${u.email}:`);
    if (!newPassword || newPassword.trim().length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    this.usersService.changeUserPassword(u.id, newPassword.trim()).subscribe({
      next: () => {
        alert('Password changed.');
        this.load();
      },
      error: (err) =>
        (this.error = err?.error?.message || 'Password change failed'),
    });
  }

  prev(): void {
    if (this.page > 1) this.load(this.page - 1);
  }

  next(): void {
    if (this.page < this.lastPage) this.load(this.page + 1);
  }
}
