import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { UserRole } from '../enums/user-role.enum';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  canActivate(): boolean {
    return this.check();
  }

  canActivateChild(): boolean {
    return this.check();
  }

private check(): boolean {
  const raw = localStorage.getItem('auth_user');
  console.log('[AdminGuard] raw auth_user =', raw);

  if (!raw) {
    console.log('[AdminGuard] no auth_user -> login');
    this.router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(raw);
  console.log('[AdminGuard] parsed user =', user);

  if (user.role === 'admin') {
    console.log('[AdminGuard] ADMIN OK');
    return true;
  }

  console.log('[AdminGuard] NOT ADMIN -> dashboard');
  this.router.navigate(['/dashboard']);
  return false;
}
}