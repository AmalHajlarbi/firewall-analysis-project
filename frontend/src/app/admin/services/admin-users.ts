import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser, CreateUserDto, UsersPageResponse } from '../interfaces/admin.interfaces';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly API = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUsers(page = 1, limit = 20): Observable<UsersPageResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<UsersPageResponse>(this.API, { params });
  }

  getUserById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.API}/${id}`);
  }

  createUser(dto: CreateUserDto): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.API, dto);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  restoreUser(id: string): Observable<{ user: AdminUser }> {
    return this.http.post<{ user: AdminUser }>(
      `${this.API}/${id}/restore`,
      {}
    );
  }

  lockUser(id: string, minutes = 15): Observable<void> {
    const params = new HttpParams().set('minutes', minutes);
    return this.http.post<void>(`${this.API}/${id}/lock`, {}, { params });
  }

  unlockUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.API}/${id}/unlock`, {});
  }

    changeOwnPassword(
    currentPassword: string,
    newPassword: string
  ): Observable<void> {
    return this.http.post<void>(`${this.API}/change-password`, {
      currentPassword,
      newPassword,
    });
  }
  
  changeUserPassword(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API}/${id}/change-password`, {
      newPassword,
    });
  }
}
