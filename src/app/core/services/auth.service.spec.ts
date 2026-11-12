import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ToastService } from '../../shared/toast/toast.service';
import { DashboardService } from '../../features/dashboard/services/dashboard.service';
import { LoginComponent } from '../../features/auth/pages/login/login.component';
import { NoticeListComponent } from '../../features/notices-notifications/pages/notice-list/notice-list.component';
import { NoticeService } from '../../features/notices-notifications/services/notice.service';
import { ActivatedRoute } from '@angular/router';

describe('API authentication and failure handling', () => {
  let requests: HttpTestingController;
  let auth: AuthService;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, DashboardService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ToastService, useValue: { error: jasmine.createSpy('error') } },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
    });
    requests = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => { requests.verify(); localStorage.clear(); delete window.nirapodConfig; });

  it('rejects a failed login without creating a demo session', () => {
    let failed = false;
    auth.login({ email: 'admin@vattax.gov.bd', password: 'wrong' }).subscribe({
      next: () => fail('Login must fail'), error: () => failed = true,
    });
    requests.expectOne(API_ENDPOINTS.AUTH.LOGIN).flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    expect(failed).toBeTrue();
    expect(auth.currentUser).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('does not accept a successful response without a server token', () => {
    auth.login({ email: 'taxpayer@nirapod.example', password: 'test' }).subscribe({
      next: () => fail('Missing token must be rejected'), error: () => {},
    });
    requests.expectOne(API_ENDPOINTS.AUTH.LOGIN).flush({ id: 1, role: 'TAXPAYER' });
    expect(auth.currentUser).toBeNull();
  });

  it('only sends the access token to the configured API', () => {
    localStorage.setItem('auth_token', 'test-only-token');
    const http = TestBed.inject(HttpClient);
    http.get('https://example.invalid/image').subscribe();
    const external = requests.expectOne('https://example.invalid/image');
    expect(external.request.headers.has('Authorization')).toBeFalse();
    external.flush({});
    http.get(API_ENDPOINTS.AUTH.PROFILE).subscribe();
    const api = requests.expectOne(API_ENDPOINTS.AUTH.PROFILE);
    expect(api.request.headers.get('Authorization')).toBe('Bearer test-only-token');
    api.flush({});
  });

  it('reports dashboard API errors without synthesizing statistics', () => {
    let failed = false;
    TestBed.inject(DashboardService).getStats().subscribe({
      next: () => fail('Statistics must not be fabricated'), error: () => failed = true,
    });
    requests.expectOne(API_ENDPOINTS.DASHBOARD.STATS).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(failed).toBeTrue();
  });

  it('clears the in-memory session when the server rejects an expired token', () => {
    auth.login({ email: 'taxpayer@nirapod.example', password: 'test' }).subscribe();
    requests.expectOne(API_ENDPOINTS.AUTH.LOGIN).flush({ id: 1, role: 'TAXPAYER', token: 'test-only-token' });
    expect(auth.isLoggedIn).toBeTrue();
    TestBed.inject(HttpClient).get(API_ENDPOINTS.AUTH.PROFILE).subscribe({ error: () => {} });
    requests.expectOne(API_ENDPOINTS.AUTH.PROFILE).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isLoggedIn).toBeFalse();
    expect(auth.currentUser).toBeNull();
  });

  it('fills a seeded account using only the configured public demo password', () => {
    window.nirapodConfig = { demoMode: true, demoPassword: 'public-demo-password-only' };
    const login = new LoginComponent(auth, TestBed.inject(Router), TestBed.inject(ToastService));
    expect(login.demoAccounts.map(account => account.email)).toEqual([
      'officer@nirapod.example', 'taxpayer@nirapod.example', 'taxpayer2@nirapod.example',
    ]);
    login.fillDemo('officer@nirapod.example');
    expect(login.password).toBe('public-demo-password-only');
  });

  it('keeps a failed notice list empty instead of substituting sample notices', () => {
    const http = TestBed.inject(HttpClient);
    const list = new NoticeListComponent(http, TestBed.inject(Router), {} as ActivatedRoute,
      auth, TestBed.inject(ToastService), new NoticeService(http));
    list.ngOnInit();
    requests.expectOne(API_ENDPOINTS.NOTICES.MY).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(list.notices).toEqual([]);
    expect(list.isLoading).toBeFalse();
  });
});
