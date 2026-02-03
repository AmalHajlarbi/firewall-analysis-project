import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminUsersService } from '../../../services/admin-users';
import { AuthService } from '../../../../auth/services/auth'; // adjust path if needed

@Component({
  selector: 'admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.html',
  styleUrls: ['./admin-header.css'],
})
export class AdminHeaderComponent {
  constructor(
    private usersService: AdminUsersService,
    private auth: AuthService,
    private router: Router
  ) {}

  changePassword() {
    const currentPassword = prompt('Current password:');
    if (!currentPassword) return;

    const newPassword = prompt(
      'New password:\n- Min 8 chars\n- Uppercase + lowercase\n- Number\n- Special character (@$!%*?&)'
    );
    if (!newPassword) return;

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }

    const strongPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

    if (!strongPass.test(newPassword)) {
      alert(
        'Password must contain uppercase, lowercase, number, and special character.'
      );
      return;
    }

    const confirmPassword = prompt('Confirm new password:');
    if (confirmPassword !== newPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.usersService.changeOwnPassword(currentPassword, newPassword).subscribe({
      next: () => alert('Password changed successfully.'),
      error: (err) =>
        alert(err?.error?.message || 'Failed to change password'),
    });
  }

  logout() {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) return;

    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.auth.clearTokens();
        this.router.navigate(['/login']);
      },
    });
  }
}
