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
