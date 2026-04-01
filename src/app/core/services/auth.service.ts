import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Role, ROLE_PERMISSIONS, ROLE_ACTIONS, ROLE_MENU } from '../constants/roles.constants';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Load from localStorage ──
  private loadUser(): AuthUser | null {
    try {
      const data = localStorage.getItem('current_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // ── Login (Spring Boot ready — falls back to mock) ──
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      tap(response => this.handleLoginSuccess(response)),
      catchError(() => {
        // ── MOCK LOGIN (remove when Spring Boot is ready) ──
        const mockUser = this.getMockUser(credentials.email);
        if (mockUser) {
          this.handleLoginSuccess(mockUser);
          return of(mockUser);
        }
        throw new Error('Invalid credentials');
      })
    );
  }

  private handleLoginSuccess(response: any): void {
    const user: AuthUser = {
      id:       response.id       ?? 1,
      fullName: response.fullName ?? response.name ?? 'Admin User',
      email:    response.email    ?? '',
      role:     response.role     ?? Role.GUEST,
      token:    response.token    ?? response.accessToken ?? ''
    };
    localStorage.setItem('current_user', JSON.stringify(user));
    if (user.token) localStorage.setItem('auth_token', user.token);
    this.currentUserSubject.next(user);
  }

  // ── Mock users (remove when Spring Boot is ready) ──
  private getMockUser(email: string): AuthUser | null {
    const mockUsers: Record<string, AuthUser> = {
      'admin@vattax.gov.bd':       { id: 1, fullName: 'System Admin',       email: 'admin@vattax.gov.bd',       role: Role.SUPER_ADMIN,         token: 'mock-token-admin' },
      'commissioner@vattax.gov.bd':{ id: 2, fullName: 'Tax Commissioner',   email: 'commissioner@vattax.gov.bd',role: Role.TAX_COMMISSIONER,    token: 'mock-token-commissioner' },
      'officer@vattax.gov.bd':     { id: 3, fullName: 'Tax Officer',        email: 'officer@vattax.gov.bd',     role: Role.TAX_OFFICER,         token: 'mock-token-officer' },
      'auditor@vattax.gov.bd':     { id: 4, fullName: 'Auditor',            email: 'auditor@vattax.gov.bd',     role: Role.AUDITOR,             token: 'mock-token-auditor' },
      'operator@vattax.gov.bd':    { id: 5, fullName: 'Data Entry Operator',email: 'operator@vattax.gov.bd',    role: Role.DATA_ENTRY_OPERATOR, token: 'mock-token-operator' },
      'taxpayer@example.com':      { id: 6, fullName: 'Abdul Karim',        email: 'taxpayer@example.com',      role: Role.TAXPAYER,            token: 'mock-token-taxpayer' },
      'guest@example.com':         { id: 7, fullName: 'Guest User',         email: 'guest@example.com',         role: Role.GUEST,               token: 'mock-token-guest' },
    };
    return mockUsers[email] ?? null;
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

  get allowedMenuItems(): string[] {
    return ROLE_MENU[this.userRole] ?? [];
  }
}