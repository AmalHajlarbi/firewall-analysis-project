import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { AdminUsersService } from '../../../services/admin-users';
import { AdminUser } from '../../../interfaces/admin.interfaces';
import { UserRole } from '../../../enums/user-role.enum';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-details.html',
  styleUrls: ['./user-details.css'],
})
export class UserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private usersService = inject(AdminUsersService);

  loading = true;
  saving = false;
  error = '';

  user!: AdminUser;
  roles = Object.values(UserRole);

  form = this.fb.group({
    email: [''],
    username: [''],
    isActive: [true],
    role: [UserRole.ANALYST],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Missing user id';
      this.loading = false;
      return;
    }
    this.load(id);
  }

  load(id: string) {
    this.loading = true;
    this.error = '';

    this.usersService.getUserById(id).subscribe({
      next: (u) => {
        this.user = u;

        // Only patch the fields that exist in the form
        this.form.patchValue({
          email: u.email,
          username: u.username,
          isActive: u.isActive,
          role: u.role,
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'User not found';
        this.loading = false;
      },
    });
  }

  save() {
    if (!this.user) return;

    this.saving = true;
    this.error = '';

    const v = this.form.getRawValue();

    this.usersService
      .updateUser(this.user.id, {
        email: v.email ?? undefined,
        username: v.username ?? undefined,
        isActive: v.isActive ?? undefined,
      })
      .subscribe({
        next: () => {
          // update role through the dedicated endpoint if changed
          if (v.role && v.role !== this.user.role) {
            this.usersService.updateRole(this.user.id, v.role).subscribe({
              next: () => {
                this.saving = false;
                this.load(this.user.id);
              },
              error: (err) => {
                this.saving = false;
                this.error = err?.error?.message || 'Role update failed';
              },
            });
          } else {
            this.saving = false;
            this.load(this.user.id);
          }
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.message || 'Update failed';
        },
      });
  }

  lock() {
    this.usersService.lockUser(this.user.id).subscribe({
      next: () => this.load(this.user.id),
      error: (err) => (this.error = err?.error?.message || 'Lock failed'),
    });
  }

  unlock() {
    this.usersService.unlockUser(this.user.id).subscribe({
      next: () => this.load(this.user.id),
      error: (err) => (this.error = err?.error?.message || 'Unlock failed'),
    });
  }

  remove() {
    if (!confirm('Delete this user?')) return;

    this.usersService.deleteUser(this.user.id).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: (err) => (this.error = err?.error?.message || 'Delete failed'),
    });
  }
}
