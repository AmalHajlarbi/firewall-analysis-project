import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class LayoutComponent {
  user = this.getStoredUser();

  constructor(private router: Router) {}

  private getStoredUser(): any {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }
}
