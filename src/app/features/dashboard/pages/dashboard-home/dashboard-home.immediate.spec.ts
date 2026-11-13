import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';
import { ToastService } from '../../../../shared/toast/toast.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardSnapshotService } from '../../services/dashboard-snapshot.service';
import { DashboardHomeComponent } from './dashboard-home.component';

describe('Immediate dashboard view', () => {
  let fixture: ComponentFixture<DashboardHomeComponent>;
  let api: any;
  let stats: Subject<any>;
  let years: Subject<any>;
  let auth: any;
  const account = {id: 1, email: 'officer@nirapod.example', role: Role.TAX_OFFICER, fullName: 'Demo Officer'};
  const summary = {
    totalTaxpayers: 42, totalRevenue: 10000000, totalVatReturns: 5, totalPayments: 6,
    pendingAudits: 2, pendingRefunds: 1, taxpayerGrowth: 0, revenueGrowth: 0,
    vatReturnGrowth: 0, paymentGrowth: 0,
  };

  beforeEach(async () => {
    sessionStorage.clear();
    stats = new Subject(); years = new Subject();
    auth = {currentUser: account};
    api = {
      getStats: jasmine.createSpy().and.returnValue(stats),
      getRecentTaxpayers: jasmine.createSpy().and.returnValue(new Subject()),
      getRecentPayments: jasmine.createSpy().and.returnValue(new Subject()),
      getChartData: jasmine.createSpy().and.returnValue(new Subject()),
      getFiscalYears: jasmine.createSpy().and.returnValue(years),
      getZones: jasmine.createSpy().and.returnValue(new Subject()),
    };
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, RouterTestingModule],
      declarations: [DashboardHomeComponent],
      providers: [DashboardSnapshotService,
        {provide: AuthService, useValue: auth}, {provide: DashboardService, useValue: api},
        {provide: ToastService, useValue: {error: jasmine.createSpy()}}],
    }).compileComponents();
  });
  afterEach(() => { fixture?.destroy(); sessionStorage.clear(); });

  function render(): void {
    fixture = TestBed.createComponent(DashboardHomeComponent);
    fixture.detectChanges();
  }

  it('renders greeting, cards and working links before any API request starts', fakeAsync(() => {
    render();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.greeting-title')?.textContent).toContain('Demo Officer');
    expect(element.querySelectorAll('.stat-card').length).toBe(6);
    expect(element.querySelectorAll('.qa-btn').length).toBe(6);
    element.querySelectorAll('.sc-value').forEach(value => expect(value.textContent?.trim()).toBe('—'));
    expect(element.querySelector('.dash-loading-overlay')).toBeNull();
    expect(element.textContent).not.toContain('Loading dashboard');
    expect(api.getStats).not.toHaveBeenCalled();
    tick(0);
    expect(api.getStats).toHaveBeenCalled();
    stats.next(summary); stats.complete(); tick(0); fixture.detectChanges();
    expect(element.querySelector('.sc-value')?.textContent).toContain('42');
    expect(fixture.componentInstance.loadingSections).toBe(5);
    fixture.destroy();
  }));

  it('restores saved values immediately and keeps them visible after a refresh failure', fakeAsync(() => {
    TestBed.inject(DashboardSnapshotService).write(account, '', 'stats', summary);
    render();
    expect(fixture.nativeElement.querySelector('.sc-value').textContent).toContain('42');
    expect(fixture.nativeElement.textContent).toContain('Last updated');
    expect(api.getStats).not.toHaveBeenCalled();
    tick(0); stats.error(new Error('offline')); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sc-value').textContent).toContain('42');
    expect(fixture.nativeElement.textContent).toContain('could not update');
    fixture.destroy();
  }));

  it('does not show the previous year values while a different year is pending', fakeAsync(() => {
    TestBed.inject(DashboardSnapshotService).write(account, '', 'stats', summary);
    render(); tick(0);
    api.getStats.and.returnValue(new Subject());
    fixture.componentInstance.onYearChange('2024-25'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sc-value').textContent.trim()).toBe('—');
    expect(fixture.componentInstance.lastUpdated).toBeNull();
    fixture.destroy();
  }));

  it('ignores late responses after logout and lets the default year metadata update', fakeAsync(() => {
    render(); tick(0);
    const fiscal = (name: string) => [{yearName: name, status: 'Active', isCurrentYear: true}];
    years.next(fiscal('2026-27')); fixture.detectChanges();
    expect(fixture.componentInstance.selectedYear).toBe('2026-27');
    years.next(fiscal('2027-28')); fixture.detectChanges();
    expect(fixture.componentInstance.selectedYear).toBe('2027-28');
    TestBed.inject(DashboardSnapshotService).clear();
    auth.currentUser = null;
    stats.next(summary); stats.complete(); tick(0);
    expect(TestBed.inject(DashboardSnapshotService).read(account)).toEqual({});
    fixture.destroy();
  }));
});
