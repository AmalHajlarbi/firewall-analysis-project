import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterPageComponent {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';

  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit() {
    this.error = '';

    if (!this.email || !this.username || !this.password) {
      this.error = 'Please fill in all fields.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.error = 'Please enter a valid email address.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.auth
      .register({
        email: this.email.trim(),
        username: this.username.trim(),
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.loading = false;
          const msg = err?.error?.message;
          this.error = Array.isArray(msg) ? msg.join(', ') : (msg || 'Registration failed');
          this.cdr.detectChanges();
        },
      });
  }
}
