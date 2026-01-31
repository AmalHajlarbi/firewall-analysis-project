import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AdminUser,
  CreateUserDto,
  UpdateUserDto,
  UsersPageResponse,
} from '../interfaces/admin.interfaces';
import { UserRole } from '../enums/user-role.enum';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly API = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // ---------------- LIST ----------------
  getUsers(page = 1, limit = 20): Observable<UsersPageResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<UsersPageResponse>(this.API, { params });
  }

  // ---------------- READ ----------------
  getUserById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.API}/${id}`);
  }

  // ---------------- CREATE ----------------
  createUser(dto: CreateUserDto): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.API, dto);
  }

  // ---------------- UPDATE ----------------
  updateUser(id: string, dto: UpdateUserDto): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.API}/${id}`, dto);
  }

  updateRole(id: string, role: UserRole): Observable<{ user: AdminUser }> {
    return this.http.patch<{ user: AdminUser }>(
      `${this.API}/${id}/role`,
      { role }
    );
  }

  // ---------------- DELETE / RESTORE ----------------
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  restoreUser(id: string): Observable<{ user: AdminUser }> {
    return this.http.post<{ user: AdminUser }>(
      `${this.API}/${id}/restore`,
      {}
    );
  }

  // ---------------- LOCK / UNLOCK ----------------
  lockUser(id: string, minutes = 15): Observable<void> {
    const params = new HttpParams().set('minutes', minutes);
    return this.http.post<void>(`${this.API}/${id}/lock`, {}, { params });
  }

  unlockUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.API}/${id}/unlock`, {});
  }

  // ---------------- PASSWORD ----------------
  changeUserPassword(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API}/${id}/change-password`, {
      newPassword,
    });
  }
}
