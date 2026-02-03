import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthResponse } from '../../services/auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginPageComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    this.error = '';
    this.loading = true;

    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res: AuthResponse) => {
        console.log('LOGIN OK. ROLE =', res.user.role);
        this.loading = false;

        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/overview']);
        } else {
          this.router.navigate(['/upload']);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('LOGIN FAILED', err.status, err?.error);
        this.loading = false;

        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : (msg || 'Wrong credentials');

        this.cdr.detectChanges();
      }
    });
  }
}
