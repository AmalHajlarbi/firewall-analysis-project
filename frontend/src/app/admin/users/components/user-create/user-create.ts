import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminUsersService } from '../../../services/admin-users';
import { UserRole } from '../../../enums/user-role.enum';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-create.html',
  styleUrls: ['./user-create.css'],
})
export class UserCreateComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(AdminUsersService);
  private router = inject(Router);

  loading = false;
  error = '';
  roles = Object.values(UserRole);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [UserRole.ANALYST],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.usersService.createUser(this.form.getRawValue() as any).subscribe({
      next: (u) => {
        this.loading = false;
        this.router.navigate(['/admin/users', u.id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Create failed';
      },
    });
  }
}
