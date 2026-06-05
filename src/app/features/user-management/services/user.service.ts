import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { User } from 'src/app/models/user.model';


@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(API_ENDPOINTS.USERS.LIST);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.USERS.GET(id));
  }

  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(API_ENDPOINTS.USERS.CREATE, user);
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(API_ENDPOINTS.USERS.UPDATE(id), user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.USERS.DELETE(id));
  }
}
