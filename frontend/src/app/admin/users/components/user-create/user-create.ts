import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminUsersService } from '../../../services/admin-users';
import { UserRole } from '../../../enums/user-role.enum';
import { CreateUserDto } from '../../../interfaces/admin.interfaces';

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

  private readonly usernamePattern = /^[a-zA-Z0-9_]+$/;
  private readonly strongPasswordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],

    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(this.usernamePattern),
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(this.strongPasswordPattern),
      ],
    ],

    role: [UserRole.ANALYST],        
    isActive: [true],               
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const dto: CreateUserDto = this.form.getRawValue() as CreateUserDto;

    this.usersService.createUser(dto).subscribe({
      next: (u) => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : (msg || 'Create failed');
      },
    });
  }
}
