import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

export interface AppUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  lastLogin?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }

  getById(id: number): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.apiUrl}/${id}`);
  }

  create(user: Partial<AppUser>): Observable<AppUser> {
    return this.http.post<AppUser>(this.apiUrl, user);
  }

  update(id: number, user: Partial<AppUser>): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
