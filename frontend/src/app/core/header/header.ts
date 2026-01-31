import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth';


@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(private auth: AuthService, private router: Router) {}

    changePassword() {
    const currentPassword = prompt('Current password:');
    if (!currentPassword) return;

    const newPassword = prompt('New password (min 6 chars):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    this.auth.changeOwnPassword(currentPassword, newPassword).subscribe({
      next: () => {
        alert('Password changed successfully.');
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to change password');
      },
    });
  }
  
  logout() {
  const confirmed = window.confirm('Are you sure you want to log out?');

  if (!confirmed) {
    return;
  }

  this.auth.logout().subscribe({
    next: () => {
      this.router.navigate(['/login']);
    },
    error: () => {
      // Even if backend fails, still log out locally
      this.auth.clearTokens();
      this.router.navigate(['/login']);
    }
  });
}

}
