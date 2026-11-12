import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  Role,
  ROLE_PERMISSIONS,
  ROLE_ACTIONS,
  ROLE_MENU,
} from '../constants/roles.constants';
import { API_ENDPOINTS } from '../constants/api.constants';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest } from 'src/app/models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(
    this.loadUser(),
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // ── Load from localStorage ──
  private loadUser(): AuthUser | null {
    try {
      const data = localStorage.getItem('current_user');
      const user = data ? JSON.parse(data) : null;
      return user?.token && !user.token.startsWith('mock-token') ? user : null;
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      tap((response) => {
        if (!response.token) throw new Error('Server did not return a login token.');
        this.handleLoginSuccess(response);
      }),
    );
  }

  private handleLoginSuccess(response: any): void {
    const user: AuthUser = {
      id: response.id ?? 1,
      fullName: response.fullName ?? '',
      email: response.email ?? '',
      role: response.role ?? Role.GUEST,
      token: response.token ?? '',
      taxpayerId:
        response.taxpayerId != null ? Number(response.taxpayerId) : null,
      taxpayerType: response.taxpayerType ?? null,
      tinNumber: response.tinNumber ?? null,
      photoUrl: response.photoUrl ?? null,
      approvalStatus: response.approvalStatus ?? null, // ← যোগ করো
    };
    localStorage.setItem('current_user', JSON.stringify(user));
    if (user.token) localStorage.setItem('auth_token', user.token);
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ── Getters ──
  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get userRole(): Role {
    return this.currentUser?.role ?? Role.GUEST;
  }

  // ── Permission checks ──
  hasPermission(module: string): boolean {
    const perms = ROLE_PERMISSIONS[this.userRole];
    return perms.includes('*') || perms.includes(module);
  }

  // auth.service.ts e add koro
  hasRole(role: Role): boolean {
    const user = this.currentUserSubject.getValue();
    if (!user) return false;
    return user.role === role || user.role === Role.SUPER_ADMIN;
  }

  canDo(action: string): boolean {
    const actions = ROLE_ACTIONS[this.userRole];
    return actions.includes(action);
  }

  canSeeMenu(menuLabel: string): boolean {
    return ROLE_MENU[this.userRole]?.includes(menuLabel) ?? false;
  }

  updateCurrentUser(user: AuthUser): void {
    localStorage.setItem('current_user', JSON.stringify(user));

    this.currentUserSubject.next(user);
  }

  get allowedMenuItems(): string[] {
    return ROLE_MENU[this.userRole] ?? [];
  }

  refreshApprovalStatus(newStatus: string): void {
    const user = this.currentUser;
    if (user) {
      user.approvalStatus = newStatus as any;
      this.updateCurrentUser(user);
    }
  }
}
