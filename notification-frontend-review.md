This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/app/features/notices-notifications//*, src/app/core//, src/app/shared/**/, src/app/models/notice.model.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
src/app/core/constants/api.constants.ts
src/app/core/constants/audit-permissions.constants.ts
src/app/core/constants/roles.constants.ts
src/app/core/directives/has-role.directive.ts
src/app/core/guards/auth.guard.ts
src/app/core/interceptors/auth.interceptor.ts
src/app/core/interceptors/error.interceptor.ts
src/app/core/services/auth.service.ts
src/app/core/services/base-api.service.ts
src/app/core/services/master-data.service.ts
src/app/core/services/tax-strcuture.service.ts
src/app/models/notice.model.ts
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="src/app/core/directives/has-role.directive.ts">
import {
  Directive, Input, TemplateRef,
  ViewContainerRef, OnInit
} from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({ selector: '[hasRole]' })
export class HasRoleDirective implements OnInit {
  @Input() hasRole: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userRole = this.authService.userRole;
    const allowed  = this.hasRole.includes(userRole);
    if (allowed || this.authService.userRole === 'SUPER_ADMIN') {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

@Directive({ selector: '[canDo]' })
export class CanDoDirective implements OnInit {
  @Input() canDo: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.canDo(this.canDo)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
</file>

<file path="src/app/core/constants/audit-permissions.constants.ts">
export const AUDIT_PERMISSIONS = {
  // Taxpayer
  AUDIT_VIEW_OWN:        'AUDIT_VIEW_OWN',
  AUDIT_UPLOAD_DOCUMENT: 'AUDIT_UPLOAD_DOCUMENT',
  AUDIT_RESPOND:         'AUDIT_RESPOND',
  AUDIT_VIEW_ORDER:      'AUDIT_VIEW_ORDER',

  // Audit Officer
  AUDIT_CREATE:           'AUDIT_CREATE',
  AUDIT_VIEW_ALL:         'AUDIT_VIEW_ALL',
  AUDIT_REQUEST_DOCUMENT: 'AUDIT_REQUEST_DOCUMENT',
  AUDIT_ADD_FINDING:      'AUDIT_ADD_FINDING',
  AUDIT_PROPOSE_ASSESSMENT: 'AUDIT_PROPOSE_ASSESSMENT',

  // Supervisor
  AUDIT_APPROVE_ASSESSMENT: 'AUDIT_APPROVE_ASSESSMENT',
  AUDIT_CLOSE:              'AUDIT_CLOSE',
  AUDIT_REASSIGN:           'AUDIT_REASSIGN',

  // Admin
  AUDIT_FULL_ACCESS: 'AUDIT_FULL_ACCESS',
} as const;

export type AuditPermission = typeof AUDIT_PERMISSIONS[keyof typeof AUDIT_PERMISSIONS];
</file>

<file path="src/app/models/notice.model.ts">
export type NoticeStatus   = 'Unread' | 'Read' | 'Responded' | 'Expired' | 'Cancelled';
export type NoticeType     = 'General' | 'Tax Due' | 'Audit Notice' | 'Penalty Notice' | 'Compliance' | 'Refund Update' | 'System' | 'Reminder';
export type NoticePriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type NoticeTarget   = 'All Taxpayers' | 'Specific Taxpayer' | 'Tax Officers' | 'Auditors' | 'All Users';

export interface Notice {
  id: number;
  noticeNo: string;
  taxpayerId: number;
  taxpayerName: string;
  tinNumber: string;
  subject: string;
  body: string;
  noticeType: NoticeType;
  priority: NoticePriority;
  targetType: NoticeTarget;
  issuedBy: string;
  issuedDate: string;
  dueDate: string;
  readDate: string;
  responseDate: string;
  responseNote: string;
  attachmentName: string;
  status: NoticeStatus;
}

export interface NoticeCreateRequest {
  taxpayerId: number | null;
  subject: string;
  body: string;
  noticeType: string;
  priority: string;
  targetType: string;
  issuedBy: string;
  issuedDate: string;
  dueDate: string;
  attachmentName: string;
}

export interface NoticeListResponse {
  data: Notice[];
  total: number;
  page: number;
}
</file>

<file path="src/app/core/interceptors/auth.interceptor.ts">
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/toast/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private toast : ToastService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('auth_token');

    if (token) {
      const headers: any = {
        Authorization: `Bearer ${token}`
      };

      if (!(request.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      request = request.clone({ setHeaders: headers });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        switch (error.status) {

          case 401:
            localStorage.removeItem('auth_token');
            this.router.navigate(['/auth/login']);
            break;

          case 403:
            this.toast.error('Access denied. You do not have permission to perform this action.');
            break;

          case 404:
            this.toast.error('The requested resource was not found.');
            break;

          case 409:
            this.toast.error(
              error.error?.message || 'A record with these details already exists.',
            );
            break;

          case 500:
            this.toast.error('A server error occurred. Please try again later.');
            break;

          default:
            break;
        }

        return throwError(() => error);
      }),
    );
  }
}
</file>

<file path="src/app/core/interceptors/error.interceptor.ts">
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../../shared/toast/toast.service';



@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toast: ToastService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400) {
          this.toast.error(err.error?.message ?? 'Invalid data. Please check your input.');
        }
        return throwError(() => err);
      }),
    );
  }
}
</file>

<file path="src/app/core/services/base-api.service.ts">
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_ENDPOINTS } from '../constants/api.constants';
@Injectable({
  providedIn: 'root'
})
export class BaseApiService {

  constructor(protected http: HttpClient) {}

  public get<T>(url: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<T>(url, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  protected post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  protected put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  protected patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url).pipe(
      catchError(this.handleError)
    );
  }

  downloadTinCertificate(tinId: number): Observable<Blob> {
    const url = API_ENDPOINTS.TINS.DOWNLOAD_CERT(tinId);
    return this.http.get(url, { responseType: 'blob' });
  }

  protected handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => error);   
  }
}
</file>

<file path="src/app/core/services/tax-strcuture.service.ts">
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { API_ENDPOINTS }            from 'src/app/core/constants/api.constants';
import { AuthService }              from 'src/app/core/services/auth.service';
import {
  TaxStructure,
  TaxStructureCreateRequest,
  TaxStructureUpdateRequest,
  TaxMasterData,
  TaxPreviewResponse,
  TaxPreviewRequest,
} from '../../models/tax-structure.model';


const FALLBACK_MASTER: TaxMasterData = {
  taxTypes:   ['VAT', 'AIT', 'Import Duty', 'Income Tax', 'Excise Duty', 'Supplementary Duty', 'Other'],
  applicables: ['All', 'Individual', 'Company', 'Import', 'Export', 'Service', 'Goods'],
  statuses:   ['Active', 'Inactive', 'Expired'],
  rateTypes:  [
    { value: 'FLAT', label: 'Flat Rate' },
    { value: 'SLAB', label: 'Progressive Slabs' },
  ],
};

@Injectable({ providedIn: 'root' })
export class TaxStructureService {

  constructor(
    private http:        HttpClient,
    private authService: AuthService,
  ) {}

  // ── Master Data ────────────────────────────────────────────────────────────

  getMasterData(): Observable<TaxMasterData> {
    return this.http
      .get<TaxMasterData>(API_ENDPOINTS.TAX_STRUCTURES.MASTER_DATA)
      .pipe(catchError(() => of(FALLBACK_MASTER)));
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  getAll(): Observable<TaxStructure[]> {
    return this.http.get<TaxStructure[]>(API_ENDPOINTS.TAX_STRUCTURES.LIST);
  }

  getById(id: number): Observable<TaxStructure> {
    return this.http.get<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.GET(id));
  }

  create(payload: TaxStructureCreateRequest): Observable<TaxStructure> {
    return this.http.post<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.CREATE, payload);
  }


  update(id: number, payload: TaxStructureUpdateRequest): Observable<TaxStructure> {
    const updatedBy = this.authService.currentUser?.fullName
                   || this.authService.currentUser?.fullName
                   || 'unknown';
    const headers = new HttpHeaders({ 'X-Updated-By': updatedBy });
    return this.http.put<TaxStructure>(
      API_ENDPOINTS.TAX_STRUCTURES.UPDATE(id), payload, { headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TAX_STRUCTURES.DELETE(id));
  }

  // ── Preview ────────────────────────────────────────────────────────────────


  previewAdHoc(req: TaxPreviewRequest): Observable<TaxPreviewResponse> {
    return this.http.post<TaxPreviewResponse>(
      API_ENDPOINTS.TAX_STRUCTURES.PREVIEW_ADHOC, req);
  }


  previewById(id: number, amount: number): Observable<TaxPreviewResponse> {
    return this.http.post<TaxPreviewResponse>(
      API_ENDPOINTS.TAX_STRUCTURES.PREVIEW(id), { amount });
  }
}
</file>

<file path="src/app/core/guards/auth.guard.ts">
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../constants/roles.constants';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(state);
  }

  canActivateChild(_childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(state);
  }

  private checkAccess(state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    const userRole     = this.authService.userRole;
    const approvalStatus = this.authService.currentUser?.approvalStatus;

    if (userRole === Role.TAXPAYER) {

      // PENDING_REVIEW 
      if (approvalStatus === 'PENDING_REVIEW') {
        const allowed =
          state.url.startsWith('/my-portal/application-status') ||
          state.url.includes('/taxpayers/edit/')   ||
          state.url.includes('/my-portal/notices');

        if (!allowed) {
          this.router.navigate(['/my-portal/application-status']);
          return false;
        }
      }

      // REJECTED 
      if (approvalStatus === 'REJECTED') {
        const allowed =
          state.url.startsWith('/my-portal/application-status') ||
          state.url.includes('/taxpayers/edit/')       ||
          state.url.includes('/my-portal/notices');   

        if (!allowed) {
          this.router.navigate(['/my-portal/application-status']);
          return false;
        }
      }

      // APPROVED 
      if (approvalStatus === 'APPROVED') {
        if (!state.url.startsWith('/my-portal')) {
          this.router.navigate(['/my-portal']);
          return false;
        }
      }
    }

    const requiredRoles = this.collectRequiredRoles(state);
    if (requiredRoles.length > 0) {
      const hasRole =
        userRole === Role.SUPER_ADMIN ||
        requiredRoles.includes(userRole);

      if (!hasRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }

  private collectRequiredRoles(state: RouterStateSnapshot): Role[] {
    let current: ActivatedRouteSnapshot | null = state.root;
    let required: Role[] = [];
    while (current) {
      const roles = current.data['roles'] as Role[] | undefined;
      if (roles?.length) {
        required = roles;
      }
      current = current.firstChild;
    }
    return required;
  }
}
</file>

<file path="src/app/core/constants/roles.constants.ts">
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TAX_COMMISSIONER = 'TAX_COMMISSIONER',
  TAX_OFFICER = 'TAX_OFFICER',
  SUPERVISOR = 'SUPERVISOR',
  AUDITOR = 'AUDITOR',
  TAXPAYER = 'TAXPAYER',
  DATA_ENTRY_OPERATOR = 'DATA_ENTRY_OPERATOR',
  GUEST = 'GUEST',
}

// ── Permission map per role ──
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: ['*'], // full access

  [Role.TAX_COMMISSIONER]: [
    'dashboard',
    'taxpayers',
    'businesses',
    'tin',
    'vat-registration',
    'vat-returns',
    'income-tax',
    'payments',
    'refunds',
    'penalties',
    'audits',
    'documents',
    'notices',
    'reports',
    'activity-logs',
  ],

  [Role.TAX_OFFICER]: [
    'dashboard',
    'taxpayers',
    'businesses',
    'tin',
    'vat-registration',
    'vat-returns',
    'income-tax',
    'payments',
    'notices',
    'documents',
  ],

  [Role.AUDITOR]: [
    'dashboard',
    'audits',
    'taxpayers',
    'businesses',
    'vat-returns',
    'income-tax',
    'documents',
    'reports',
    'notices',
  ],

  [Role.DATA_ENTRY_OPERATOR]: [
    'dashboard',
    'taxpayers',
    'businesses',
    'tin',
    'vat-registration',
    'vat-returns',
    'income-tax',
    'payments',
  ],

  [Role.TAXPAYER]: [
    'taxpayers',
    'my-profile',
    'vat-returns',
    'income-tax',
    'payments',
    'notices',
    'refunds',
  ],

  [Role.SUPERVISOR]: [
    'dashboard',
    'audits',
    'taxpayers',
    'reports',
    'notices',
    'documents',
  ],

  [Role.GUEST]: ['dashboard'],
};

// ── Button-level permissions ──
export const ROLE_ACTIONS: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: [
    'create',
    'edit',
    'delete',
    'view',
    'export',
    'manage-users',
  ],
  [Role.TAX_COMMISSIONER]: ['create', 'edit', 'delete', 'view', 'export'],
  [Role.TAX_OFFICER]: ['create', 'edit', 'view'],
  [Role.AUDITOR]: ['view', 'export', 'create', 'edit'],
  [Role.SUPERVISOR]: ['view', 'export', 'create', 'edit'],
  [Role.DATA_ENTRY_OPERATOR]: ['create', 'edit', 'view'],
  [Role.TAXPAYER]: ['view', 'create'],
  [Role.GUEST]: ['view'],
};

// ── Sidebar menu visibility per role ──
export const ROLE_MENU: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: [
    'Dashboard',
    'Taxpayer Management',
    'Business Registration',
    'TIN Management',
    'VAT Registration',
    'VAT Returns',
    'Income Tax Returns',
    'Payments',
    'Refund Management',
    'Penalty & Fines',
    'Audit Management',
    'Document Verification',
    'Notices & Notifications',
    'Reports & Analytics',
    'User Management',
    'Roles & Permissions',
    'Activity Logs',
    'System Settings',
  ],

  [Role.TAX_COMMISSIONER]: [
    'Dashboard',
    'Taxpayer Management',
    'Business Registration',
    'TIN Management',
    'VAT Registration',
    'VAT Returns',
    'Income Tax Returns',
    'Payments',
    'Refund Management',
    'Penalty & Fines',
    'Audit Management',
    'Document Verification',
    'Notices & Notifications',
    'Reports & Analytics',
    'Activity Logs',
  ],

  [Role.TAX_OFFICER]: [
    'Dashboard',
    'Taxpayer Management',
    'Business Registration',
    'TIN Management',
    'VAT Registration',
    'VAT Returns',
    'Income Tax Returns',
    'Payments',
    'Document Verification',
    'Notices & Notifications',
  ],

  [Role.AUDITOR]: [
    'Dashboard',
    'Audit Management',
    'Taxpayer Management',
    'Business Registration',
    'VAT Returns',
    'Income Tax Returns',
    'Document Verification',
    'Reports & Analytics',
    'Notices & Notifications',
  ],

  [Role.SUPERVISOR]: [
    'Dashboard',
    'Audit Management',
    'Taxpayer Management',
    'Document Verification',
    'Notices & Notifications',
    'Reports & Analytics',
  ],

  [Role.DATA_ENTRY_OPERATOR]: [
    'Dashboard',
    'Taxpayer Management',
    'Business Registration',
    'TIN Management',
    'VAT Registration',
    'VAT Returns',
    'Income Tax Returns',
    'Payments',
  ],

  [Role.TAXPAYER]: [
    'VAT Returns',
    'Income Tax Returns',
    'AIT',
    'TIN Management',
    'Payments',
    'Refund Management',
    'Notices & Notifications',
  ],

  [Role.GUEST]: ['Dashboard'],
};
</file>

<file path="src/app/core/services/auth.service.ts">
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      tap((response) => this.handleLoginSuccess(response)),
      catchError((err) => {
        if (!environment.useMockAuth) {
          return throwError(() => err);
        }
        const mockUser = this.getMockUser(credentials.email);
        if (mockUser) {
          this.handleLoginSuccess(mockUser);
          return of(mockUser);
        }
        return throwError(() => new Error('Invalid credentials'));
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

  private getMockUser(email: string): AuthUser | null {
    const mockUsers: Record<string, AuthUser> = {
      'admin@vattax.gov.bd': {
        id: 1,
        fullName: 'System Admin',
        email: 'admin@vattax.gov.bd',
        role: Role.SUPER_ADMIN,
        token: 'mock-token-admin',
      },
      'commissioner@vattax.gov.bd': {
        id: 2,
        fullName: 'Tax Commissioner',
        email: 'commissioner@vattax.gov.bd',
        role: Role.TAX_COMMISSIONER,
        token: 'mock-token-commissioner',
      },
      'officer@vattax.gov.bd': {
        id: 3,
        fullName: 'Tax Officer',
        email: 'officer@vattax.gov.bd',
        role: Role.TAX_OFFICER,
        token: 'mock-token-officer',
      },
      'auditor@vattax.gov.bd': {
        id: 4,
        fullName: 'Auditor',
        email: 'auditor@vattax.gov.bd',
        role: Role.AUDITOR,
        token: 'mock-token-auditor',
      },
      'supervisor@vattax.gov.bd': {
        id: 8,
        fullName: 'Abdul Karim Supervisor',
        email: 'supervisor@vattax.gov.bd',
        role: Role.SUPERVISOR,
        token: 'mock-token-supervisor',
      },
      'operator@vattax.gov.bd': {
        id: 5,
        fullName: 'Data Entry Operator',
        email: 'operator@vattax.gov.bd',
        role: Role.DATA_ENTRY_OPERATOR,
        token: 'mock-token-operator',
      },
      'taxpayer@example.com': {
        id: 6,
        fullName: 'Abdul Karim',
        email: 'taxpayer@example.com',
        role: Role.TAXPAYER,
        token: 'mock-token-taxpayer',
      },
      'guest@example.com': {
        id: 7,
        fullName: 'Guest User',
        email: 'guest@example.com',
        role: Role.GUEST,
        token: 'mock-token-guest',
      },
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
</file>

<file path="src/app/core/services/master-data.service.ts">
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AitSourceType,
  AitStatus,
} from 'src/app/features/ait/models/ait.model';
import { FiscalYear } from 'src/app/models/fiscal-year.model';
import {
  BusinessCategory,
  BusinessType,
  TaxCircle,
  TaxpayerType,
  TaxZone,
} from 'src/app/models/master-data.model';
import { District, Division } from 'src/app/models/master-data.model';

@Injectable({ providedIn: 'root' })
export class MasterDataService extends BaseApiService {
  getDivisions(): Observable<Division[]> {
    return this.get<Division[]>(API_ENDPOINTS.MASTER_DATA.DIVISIONS).pipe(
      catchError(() => of([])),
    );
  }

  getDistrictsByDivision(divisionId: number): Observable<District[]> {
    return this.get<District[]>(
      API_ENDPOINTS.MASTER_DATA.DISTRICTS_BY_DIVISION(divisionId),
    ).pipe(catchError(() => of([])));
  }

  getTaxpayerTypes(): Observable<TaxpayerType[]> {
    return this.get<TaxpayerType[]>(
      API_ENDPOINTS.MASTER_DATA.TAXPAYER_TYPES,
    ).pipe(catchError(() => of([])));
  }

  getActiveTaxpayers(): Observable<any[]> {
    return this.get<any[]>(
      `${API_ENDPOINTS.TAXPAYERS.LIST}?status=Active`,
    ).pipe(catchError(() => of([])));
  }

  getBusinessTypes(): Observable<BusinessType[]> {
    return this.get<BusinessType[]>(
      API_ENDPOINTS.MASTER_DATA.BUSINESS_TYPES,
    ).pipe(catchError(() => of([])));
  }

  getBusinessCategories(): Observable<BusinessCategory[]> {
    return this.get<BusinessCategory[]>(
      API_ENDPOINTS.MASTER_DATA.BUSINESS_CATEGORIES,
    ).pipe(catchError(() => of([])));
  }

  getAitSourceTypes(): Observable<AitSourceType[]> {
    return this.get<AitSourceType[]>(
      API_ENDPOINTS.MASTER_DATA.AIT_SOURCE_TYPES,
    ).pipe(catchError(() => of([])));
  }


  getAitStatuses(): Observable<AitStatus[]> {
    return this.get<AitStatus[]>(API_ENDPOINTS.MASTER_DATA.AIT_STATUSES).pipe(
      catchError(() => of([])),
    );
  }

  getFiscalYears(): Observable<FiscalYear[]> {
    return this.get<FiscalYear[]>(API_ENDPOINTS.FISCAL_YEARS.LIST).pipe(
      catchError(() => of([])),
    );
  }

  getImportPorts(): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.MASTER_DATA.IMPORT_PORTS).pipe(
      catchError(() => of([])),
    );
  }

  getImportCountries(): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.MASTER_DATA.IMPORT_COUNTRIES).pipe(
      catchError(() => of([])),
    );
  }

  getImportDutyStatuses(): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.MASTER_DATA.IMPORT_DUTY_STATUSES).pipe(
      catchError(() => of([])),
    );
  }

  getTaxZones(): Observable<TaxZone[]> {
    return this.get<TaxZone[]>(API_ENDPOINTS.MASTER_DATA.TAX_ZONES).pipe(
      catchError(() => of([]))
    );
  }

  getTaxZonesByDistrict(districtId: number): Observable<any[]> {
    return this.get<any[]>(
      API_ENDPOINTS.MASTER_DATA.TAX_ZONES_BY_DISTRICT(districtId),
    ).pipe(catchError(() => of([])));
  }

  getTaxCirclesByZone(zoneId: number): Observable<any[]> {
    return this.get<any[]>(
      API_ENDPOINTS.MASTER_DATA.TAX_CIRCLES_BY_ZONE(zoneId),
    ).pipe(catchError(() => of([])));
  }
}
</file>

<file path="src/app/core/constants/api.constants.ts">
export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Dashboard
  DASHBOARD: {
    STATS: `${API_BASE_URL}/dashboard/stats`,
    RECENT_TAXPAYERS: `${API_BASE_URL}/dashboard/recent-taxpayers`,
    RECENT_PAYMENTS: `${API_BASE_URL}/dashboard/recent-payments`,
    VAT_CHART: `${API_BASE_URL}/dashboard/vat-chart`,
    PAYMENT_CHART: `${API_BASE_URL}/dashboard/payment-chart`,
    ZONE_VAT: `${API_BASE_URL}/dashboard/zone-vat`,
  },

  // Taxpayer
  TAXPAYERS: {
    LIST: `${API_BASE_URL}/taxpayers`,
    CREATE: `${API_BASE_URL}/taxpayers`,
    UPDATE: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    GET: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    UPLOAD_PHOTO: (id: number) => `${API_BASE_URL}/taxpayers/${id}/photo`,
    GET_PHOTO: (id: number) => `${API_BASE_URL}/taxpayers/${id}/photo`,
    PENDING: `${API_BASE_URL}/taxpayers/pending`,
    APPROVE: (id: number) => `${API_BASE_URL}/taxpayers/${id}/approve`,
    REJECT: (id: number) => `${API_BASE_URL}/taxpayers/${id}/reject`,
    MY_APPLICATION: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    EXPORT: `${API_BASE_URL}/taxpayers/export`,
  },

  // Business
  BUSINESSES: {
    LIST: `${API_BASE_URL}/businesses`,
    CREATE: `${API_BASE_URL}/businesses`,
    UPDATE: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    GET: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    BY_TAXPAYER_VAT_STATUS: (taxpayerId: number) =>
      `${API_BASE_URL}/businesses/by-taxpayer/${taxpayerId}/vat-status`,
  },

  // TIN Management
  TINS: {
    LIST: `${API_BASE_URL}/tins`,
    CREATE: `${API_BASE_URL}/tins`,
    UPDATE: (id: number) => `${API_BASE_URL}/tins/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/tins/${id}`,
    GET: (id: number) => `${API_BASE_URL}/tins/${id}`,
    BY_TAXPAYER: (taxpayerId: number) =>
      `${API_BASE_URL}/tins/my-tin/${taxpayerId}`,
    EXPORT: `${API_BASE_URL}/tins/export`,
    BASE: `${API_BASE_URL}/tins`,
    DOWNLOAD_CERT: (id: number) => `${API_BASE_URL}/tins/${id}/certificate`,
  },

  // VAT Registration
  VAT_REGISTRATIONS: {
    LIST: `${API_BASE_URL}/vat-registrations`,
    CREATE: `${API_BASE_URL}/vat-registrations`,
    UPDATE: (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
    GET: (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
  },

  // VAT Returns
  VAT_RETURNS: {
    LIST: `${API_BASE_URL}/vat-returns`,
    CREATE: `${API_BASE_URL}/vat-returns`,
    UPDATE: (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
    GET: (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
  },

  // Income Tax Returns
  INCOME_TAX_RETURNS: {
    LIST: `${API_BASE_URL}/income-tax-returns`,
    CREATE: `${API_BASE_URL}/income-tax-returns`,
    PREVIEW: `${API_BASE_URL}/income-tax-returns/preview`,
    UPDATE: (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    GET: (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    UPDATE_STATUS: (id: number) =>
      `${API_BASE_URL}/income-tax-returns/${id}/status`,
    EXPORT: `${API_BASE_URL}/income-tax-returns/export`,
  },

  IT10B: {
    CREATE: `${API_BASE_URL}/it10b`,
    BY_RETURN: (returnId: number) =>
      `${API_BASE_URL}/it10b/by-return/${returnId}`,
    GET: (id: number) => `${API_BASE_URL}/it10b/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/it10b/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/it10b/${id}`,
  },

  // AIT (Advance Income Tax)
  AITS: {
    LIST: `${API_BASE_URL}/ait-records`,
    CREATE: `${API_BASE_URL}/ait-records`,
    UPDATE: (id: number) => `${API_BASE_URL}/ait-records/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/ait-records/${id}`,
    GET: (id: number) => `${API_BASE_URL}/ait-records/${id}`,
    DOCUMENTS: {
      LIST: (aitId: number) => `${API_BASE_URL}/ait-records/${aitId}/documents`,
      UPLOAD: (aitId: number) =>
        `${API_BASE_URL}/ait-records/${aitId}/documents`,
      DELETE: (aitId: number, docId: number) =>
        `${API_BASE_URL}/ait-records/${aitId}/documents/${docId}`,
      DOWNLOAD: (aitId: number, docId: number) =>
            `${API_BASE_URL}/ait-records/${aitId}/documents/${docId}/download`,
    },

    // Document requests
    DOC_REQUESTS: (id: number) =>
      `${API_BASE_URL}/ait-records/${id}/document-requests`,
    DOC_REQUESTS_PENDING: `${API_BASE_URL}/ait-records/document-requests/pending`,
    DOC_REQUESTS_OVERDUE: `${API_BASE_URL}/ait-records/document-requests/overdue`,
    DOC_REQUEST_FULFILL: (reqId: number) =>
      `${API_BASE_URL}/ait-records/document-requests/${reqId}/fulfill`,
    // Queue
    QUEUE_PENDING: `${API_BASE_URL}/ait-records/queue/pending`,
    QUEUE_MINE: `${API_BASE_URL}/ait-records/queue/mine`,

    BY_ID: (id: number) => `${API_BASE_URL}/ait-records/${id}`,
    CERTIFICATE: (id: number) =>
      `${API_BASE_URL}/ait-records/${id}/certificate`,

    // Workflow
    SUBMIT: (id: number) => `${API_BASE_URL}/ait-records/${id}/submit`,
    VERIFY_CHALLAN: (id: number) =>
      `${API_BASE_URL}/ait-records/${id}/verify-challan`,
    ASSIGN: (id: number) => `${API_BASE_URL}/ait-records/${id}/assign`,
    APPROVE: (id: number) => `${API_BASE_URL}/ait-records/${id}/approve`,
    REJECT: (id: number) => `${API_BASE_URL}/ait-records/${id}/reject`,
    RESUBMIT: (id: number) => `${API_BASE_URL}/ait-records/${id}/resubmit`,
    CREDIT: (id: number) => `${API_BASE_URL}/ait-records/${id}/credit`,
  },

  AIT_CREDIT_LEDGER: {
    MY:               `${API_BASE_URL}/ait-credit-ledger/my`,
    MY_AVAILABLE:     `${API_BASE_URL}/ait-credit-ledger/my/available`,
    MY_TOTAL:         `${API_BASE_URL}/ait-credit-ledger/my/total`,
    BY_ID:            (id: number)     => `${API_BASE_URL}/ait-credit-ledger/${id}`,
    BY_TAXPAYER:      (tpId: number)   => `${API_BASE_URL}/ait-credit-ledger/taxpayer/${tpId}`,
    APPLY:            `${API_BASE_URL}/ait-credit-ledger/apply`,
    ITR_APPLICATIONS: (itrId: number)  => `${API_BASE_URL}/ait-credit-ledger/itr/${itrId}/applications`,
    ITR_TOTAL:        (itrId: number)  => `${API_BASE_URL}/ait-credit-ledger/itr/${itrId}/total`,
  },

  // Fiscal Years
  FISCAL_YEARS: {
    LIST: `${API_BASE_URL}/fiscal-years`,
    ACTIVE: `${API_BASE_URL}/fiscal-years/active`,
    CREATE: `${API_BASE_URL}/fiscal-years`,
    UPDATE: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
    GET: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
  },

  // Import Duty
  IMPORT_DUTIES: {
    LIST: `${API_BASE_URL}/import-duty`,
    CREATE: `${API_BASE_URL}/import-duty`,
    GET: (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    PREVIEW: `${API_BASE_URL}/import-duty/preview-tax`,
  },

  // Certificate
  CERTIFICATES: {
    DOWNLOAD_TIN: (id: number) => `${API_BASE_URL}/tins/${id}/certificate`,
    DOWNLOAD_BIN: (id: number) =>
      `${API_BASE_URL}/vat-registrations/${id}/certificate`,
    TAX_CLEARANCE_LIST: `${API_BASE_URL}/tax-clearances`,
    DOWNLOAD_TAX_CLEARANCE: (id: number) =>
      `${API_BASE_URL}/tax-clearances/${id}/certificate`,
    PUBLIC_VERIFY: `${API_BASE_URL}/tax-clearances/public/verify`,
    DOWNLOAD_RETURN_ACK: (id: number) =>
      `${API_BASE_URL}/income-tax-returns/${id}/acknowledgment`,
  },

  // Payments
  PAYMENTS: {
    LIST: `${API_BASE_URL}/payments`,
    CREATE: `${API_BASE_URL}/payments`,
    GET: (id: number) => `${API_BASE_URL}/payments/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/payments/${id}`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/payments/${id}/status`,
    BY_TAXPAYER:   (taxpayerId: number) => `${API_BASE_URL}/payments?taxpayerId=${taxpayerId}`,
  },

  // Notices & Notifications
  NOTICES: {
    LIST: `${API_BASE_URL}/notices`,
    CREATE: `${API_BASE_URL}/notices`,
    GET: (id: number) => `${API_BASE_URL}/notices/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/notices/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/notices/${id}`,
    READ: (id: number) => `${API_BASE_URL}/notices/${id}/read`, // ← এটা যোগ করো
  },

  // Penalties & Fines
  PENALTIES: {
    LIST: `${API_BASE_URL}/penalties`,
    CREATE: `${API_BASE_URL}/penalties`,
    GET: (id: number) => `${API_BASE_URL}/penalties/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/penalties/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/penalties/${id}`,
    SUBMIT: (id: number) => `${API_BASE_URL}/penalties/${id}/submit`,
    APPROVE: (id: number) => `${API_BASE_URL}/penalties/${id}/approve`,
    REJECT: (id: number) => `${API_BASE_URL}/penalties/${id}/reject`,
    ISSUE: (id: number) => `${API_BASE_URL}/penalties/${id}/issue`,
    CANCEL: (id: number) => `${API_BASE_URL}/penalties/${id}/cancel`,
  },

  // Documents
  DOCUMENTS: {
    LIST: `${API_BASE_URL}/documents`,
    CREATE: `${API_BASE_URL}/documents`,
    GET: (id: number) => `${API_BASE_URL}/documents/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/documents/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/documents/${id}`,
  },

  // Audits
  AUDITS: {
    LIST: `${API_BASE_URL}/audits`,
    CREATE: `${API_BASE_URL}/audits`,
    GET: (id: number) => `${API_BASE_URL}/audits/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/audits/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/audits/${id}`,
    SEARCH: `${API_BASE_URL}/audits/search`,
    KPIS: `${API_BASE_URL}/audits/kpis`,
    STATUS: (id: number) => `${API_BASE_URL}/audits/${id}/status`,
    ISSUE_NOTICE: (id: number) => `${API_BASE_URL}/audits/${id}/issue-notice`,
    QUERIES: (id: number) => `${API_BASE_URL}/audits/${id}/queries`,
    FINDINGS: (id: number) => `${API_BASE_URL}/audits/${id}/findings`,
    DOC_REQUESTS: (id: number) =>
      `${API_BASE_URL}/audits/${id}/document-requests`,
    REQUEST_DOCS: (id: number) =>
      `${API_BASE_URL}/audits/${id}/request-documents`,
    ASSESSMENT: (id: number) => `${API_BASE_URL}/audits/${id}/assessment`,
    PROPOSE: (id: number) => `${API_BASE_URL}/audits/${id}/propose-assessment`,
    APPROVE: (id: number) => `${API_BASE_URL}/audits/${id}/approve-assessment`,
    DEMAND: (id: number) => `${API_BASE_URL}/audits/${id}/demand-notice`,
    ISSUE_DEMAND: (id: number) => `${API_BASE_URL}/audits/${id}/issue-demand`,

    // Taxpayer portal
    MY_LIST: `${API_BASE_URL}/my-portal/audits/my`,
    MY_GET: (id: number) => `${API_BASE_URL}/my-portal/audits/${id}`,
    MY_RESPOND: (id: number) =>
      `${API_BASE_URL}/my-portal/audits/${id}/respond`,
    MY_UPLOAD: (id: number) =>
      `${API_BASE_URL}/my-portal/audits/${id}/upload-documents`,
    MY_ASSESSMENT: (id: number) =>
      `${API_BASE_URL}/my-portal/audits/${id}/assessment`,
    MY_DEMAND: (id: number) =>
      `${API_BASE_URL}/my-portal/audits/${id}/demand-notice`,
  },

  // Users
  USERS: {
    LIST: `${API_BASE_URL}/users`,
    CREATE: `${API_BASE_URL}/users`,
    GET: (id: number) => `${API_BASE_URL}/users/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/users/${id}`,
  },

  // Roles
  ROLES: {
    LIST: `${API_BASE_URL}/roles`,
    CREATE: `${API_BASE_URL}/roles`,
    GET: (id: number) => `${API_BASE_URL}/roles/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/roles/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/roles/${id}`,
  },

  // Reports
  REPORTS: {
    VAT_SUMMARY: `${API_BASE_URL}/reports/vat-summary`,
    PAYMENT_SUMMARY: `${API_BASE_URL}/reports/payment-summary`,
    TAXPAYER_STATS: `${API_BASE_URL}/reports/taxpayer-stats`,
    KPI_SUMMARY: `${API_BASE_URL}/reports/kpi-summary`,
    REVENUE_TREND: `${API_BASE_URL}/reports/revenue-trend`,
    ZONE_PERFORMANCE: `${API_BASE_URL}/reports/zone-performance`,
    COMPLIANCE_RATE: `${API_BASE_URL}/reports/compliance-rate`,
    VAT_COLLECTION: `${API_BASE_URL}/reports/vat-collection`,
    INCOME_TAX: `${API_BASE_URL}/reports/income-tax`,
    PENALTY_COLLECTION: `${API_BASE_URL}/reports/penalty-collection`,
    REFUND_STATUS: `${API_BASE_URL}/reports/refund-status`,
    AIT_DEDUCTION: `${API_BASE_URL}/reports/ait-deduction`, // ← ADD
    IMPORT_DUTY: `${API_BASE_URL}/reports/import-duty`, // ← ADD
    TAX_BREAKDOWN: `${API_BASE_URL}/reports/tax-breakdown`, // ← ADD
    EXPORT: `${API_BASE_URL}/reports/export`
  },

  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    REGISTER: `${API_BASE_URL}/public/register`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
  },

  // TaxStructures
  TAX_STRUCTURES: {
    LIST: `${API_BASE_URL}/tax-structures`,
    CREATE: `${API_BASE_URL}/tax-structures`,
    UPDATE: (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    GET: (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    MASTER_DATA: `${API_BASE_URL}/tax-structures/master-data`,
    PREVIEW: (id: number) => `${API_BASE_URL}/tax-structures/${id}/preview`,
    PREVIEW_ADHOC: `${API_BASE_URL}/tax-structures/preview`,
    BY_SOURCE: (source: string) =>
      `${API_BASE_URL}/tax-structures?source=${source}`,
  },

  // TaxableProducts
  TAXABLE_PRODUCTS: {
    LIST: `${API_BASE_URL}/taxable-products`,
    CREATE: `${API_BASE_URL}/taxable-products`,
    UPDATE: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    GET: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    CATEGORIES: `${API_BASE_URL}/taxable-products/categories`,
    UNITS: `${API_BASE_URL}/taxable-products/units`,
  },

  // Refunds
  REFUNDS: {
    LIST: `${API_BASE_URL}/refunds`,
    MY: `${API_BASE_URL}/refunds/my`,
    CREATE: `${API_BASE_URL}/refunds`,
    GET: (id: number) => `${API_BASE_URL}/refunds/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/refunds/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/refunds/${id}`,
    SUBMIT: (id: number) => `${API_BASE_URL}/refunds/${id}/submit`,
    RESPOND: (id: number) => `${API_BASE_URL}/refunds/${id}/respond`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/refunds/${id}/status`,
    STATUS_HISTORY: (id: number) =>
      `${API_BASE_URL}/refunds/${id}/status-history`,
    VALIDATE_BANK: `${API_BASE_URL}/refunds/validate-bank`,
    CALCULATE: `${API_BASE_URL}/refunds/calculate`,
    QUEUE: {
      OFFICER: `${API_BASE_URL}/refunds/queue/officer`,
      SUPERVISOR: `${API_BASE_URL}/refunds/queue/supervisor`,
      FINANCE: `${API_BASE_URL}/refunds/queue/finance`,
    },
    SOURCES: {
      ITR: `${API_BASE_URL}/refunds/sources/itr`,
      AIT: `${API_BASE_URL}/refunds/sources/ait`,
      VAT: `${API_BASE_URL}/refunds/sources/vat`,
      PAYMENTS: `${API_BASE_URL}/refunds/sources/payments`,
    },
    DOCUMENTS: {
      LIST: (id: number) => `${API_BASE_URL}/refunds/${id}/documents`,
      UPLOAD: (id: number) => `${API_BASE_URL}/refunds/${id}/documents`,
      DELETE: (id: number, docId: number) =>
        `${API_BASE_URL}/refunds/${id}/documents/${docId}`,
      GET: (id: number, docId: number) =>
        `${API_BASE_URL}/refunds/${id}/documents/${docId}`,
    },
  },

  // MasterData
  MASTER_DATA: {
    DIVISIONS: `${API_BASE_URL}/master/divisions`,
    DISTRICTS: `${API_BASE_URL}/master/districts`,
    TAXPAYER_TYPES: `${API_BASE_URL}/master/taxpayer-types`,
    BUSINESS_TYPES: `${API_BASE_URL}/master/business-types`,
    BUSINESS_CATEGORIES: `${API_BASE_URL}/master/business-categories`,
    AIT_SOURCE_TYPES: `${API_BASE_URL}/master/ait/source-types`,
    AIT_STATUSES: `${API_BASE_URL}/master/ait/statuses`,
    IMPORT_PORTS: `${API_BASE_URL}/master/import-duty/ports`,
    IMPORT_COUNTRIES: `${API_BASE_URL}/master/import-duty/countries`,
    IMPORT_DUTY_STATUSES: `${API_BASE_URL}/master/import-duty/statuses`,

    TAX_ZONES: `${API_BASE_URL}/master/tax-zones`,
    DISTRICTS_BY_DIVISION: (divisionId: number) =>
      `${API_BASE_URL}/master/divisions/${divisionId}/districts`,
    TAX_ZONES_BY_DISTRICT: (districtId: number) =>
      `${API_BASE_URL}/master/districts/${districtId}/tax-zones`,
    TAX_CIRCLES_BY_ZONE: (zoneId: number) =>
      `${API_BASE_URL}/master/tax-zones/${zoneId}/tax-circles`,
  },
};
</file>

</files>
