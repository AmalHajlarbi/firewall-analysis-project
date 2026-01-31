import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRole } from '../../admin/enums/user-role.enum';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;     
  isActive: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'http://localhost:3000/auth';
  private usersUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          this.saveTokens(res.access_token, res.refresh_token);
          this.saveUser(res.user);
        })
      );
  }

  register(data: { email: string; username: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authUrl}/register`, data)
      .pipe(
        tap((res) => {
          this.saveTokens(res.access_token, res.refresh_token);
          this.saveUser(res.user);
        })
      );
  }

  profile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.usersUrl}/profile`).pipe(
      tap((user) => this.saveUser(user))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.authUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearTokens();
        this.clearUser();
      })
    );
  }

  refresh(): Observable<{ access_token: string; refresh_token: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<{ access_token: string; refresh_token: string }>(`${this.authUrl}/refresh`, { refreshToken })
      .pipe(tap((res) => this.saveTokens(res.access_token, res.refresh_token)));
  }

  saveUser(user: AuthUser) {
    localStorage.setItem('auth_user', JSON.stringify(user)); // ✅ consistent key
  }

  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  clearUser() {
    localStorage.removeItem('auth_user');
  }

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === UserRole.ADMIN; 
  }

changeOwnPassword(currentPassword: string, newPassword: string) {
  return this.http.post(`${this.authUrl}/change-password`, {
    currentPassword,
    newPassword,
  });
}


}
