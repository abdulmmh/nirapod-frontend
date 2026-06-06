import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role, RoleCreateRequest, RoleResponse } from 'src/app/models/role.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';

@Injectable({ providedIn: 'root' })
export class RoleService  {

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<RoleResponse[]>(API_ENDPOINTS.ROLES.LIST).pipe(
      map(roles => roles.map(r => this.parseRole(r)))
    );
  }

  getById(id: number): Observable<Role> {
    return this.http.get<RoleResponse>(API_ENDPOINTS.ROLES.GET(id)).pipe(
      map(r => this.parseRole(r))
    );
  }

  create(request: RoleCreateRequest): Observable<Role> {
    return this.http.post<RoleResponse>(API_ENDPOINTS.ROLES.CREATE, request).pipe(
      map(r => this.parseRole(r))
    );
  }

  update(id: number, request: RoleCreateRequest): Observable<Role> {
    return this.http.put<RoleResponse>(API_ENDPOINTS.ROLES.UPDATE(id), request).pipe(
      map(r => this.parseRole(r))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ROLES.DELETE(id));
  }

  // Parses the permissions JSON string into a typed array
  private parseRole(r: RoleResponse): Role {
    let permissions = [];
    try {
      permissions = r.permissions ? JSON.parse(r.permissions) : [];
    } catch {
      permissions = [];
    }
    return { ...r, permissions } as Role;
  }
}
