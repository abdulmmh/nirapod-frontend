import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';
import {
  DashboardStats, RecentTaxpayer, RecentPayment,
  RecentAudit, RecentEntry, MyNotice, MyReturn,
  DashboardChartData
} from '../../../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  isLoading = true;
  hasError  = false;

  stats:           DashboardStats    | null = null;
  chartData:       DashboardChartData| null = null;
  recentTaxpayers: RecentTaxpayer[]  = [];
  recentPayments:  RecentPayment[]   = [];
  recentAudits:    RecentAudit[]     = [];
  recentEntries:   RecentEntry[]     = [];
  myNotices:       MyNotice[]        = [];
  myReturns:       MyReturn[]        = [];

  vatBars:     number[] = [];
  paymentBars: number[] = [];
  auditBars:   number[] = [];
  myPayBars:   number[] = [];

  Role = Role;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  get role(): Role { return this.authService.userRole; }
  get user()       { return this.authService.currentUser; }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  get roleLabel(): string {
    const map: Record<Role, string> = {
      [Role.SUPER_ADMIN]:         'System Administrator',
      [Role.TAX_COMMISSIONER]:    'Tax Commissioner',
      [Role.TAX_OFFICER]:         'Tax Officer',
      [Role.AUDITOR]:             'Auditor',
      [Role.DATA_ENTRY_OPERATOR]: 'Data Entry Operator',
      [Role.TAXPAYER]:            'Taxpayer',
      [Role.GUEST]:               'Guest'
    };
    return map[this.role] ?? '';
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.hasError  = false;

    this.dashboardService.loadAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([stats, taxpayers, payments, chart, audits, entries, notices, returns]) => {
          this.stats           = stats;
          this.recentTaxpayers = taxpayers;
          this.recentPayments  = payments;
          this.chartData       = chart;
          this.recentAudits    = audits;
          this.recentEntries   = entries;
          this.myNotices       = notices;
          this.myReturns       = returns;
          this.buildBars();
          this.isLoading = false;
        },
        error: () => { this.hasError = true; this.isLoading = false; }
      });
  }

  private buildBars(): void {
    if (!this.chartData) return;
    const maxOf = (arr: any[]) => Math.max(...arr.map(d => d.value));
    const pct   = (arr: any[], max: number) => arr.map(d => Math.round((d.value / max) * 100));

    this.vatBars     = pct(this.chartData.vatChart,       maxOf(this.chartData.vatChart));
    this.paymentBars = pct(this.chartData.paymentChart,   maxOf(this.chartData.paymentChart));
    this.auditBars   = pct(this.chartData.auditChart,     maxOf(this.chartData.auditChart));
    this.myPayBars   = pct(this.chartData.myPaymentChart, maxOf(this.chartData.myPaymentChart));
  }

  stat(key: keyof DashboardStats): number {
    return this.stats ? (this.stats[key] as number) : 0;
  }

  fmt(val: number, type: 'currency' | 'number' = 'number'): string {
    if (type === 'currency') {
      if (val >= 10000000) return `৳${(val / 10000000).toFixed(1)} Cr`;
      if (val >= 100000)   return `৳${(val / 100000).toFixed(1)} L`;
      if (val >= 1000)     return `৳${(val / 1000).toFixed(1)} K`;
      return `৳${val.toLocaleString()}`;
    }
    return val.toLocaleString();
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Suspended': 'status-suspended', 'Completed': 'status-active',
      'Pending': 'status-pending', 'Failed': 'status-suspended',
      'In Progress': 'status-progress', 'Flagged': 'status-flagged',
      'Approved': 'status-active', 'Rejected': 'status-suspended',
      'Submitted': 'status-progress', 'Saved': 'status-pending',
      'Unread': 'status-flagged', 'Read': 'status-inactive',
      'Responded': 'status-active'
    };
    return map[status] ?? '';
  }

  get today(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric',
    month: 'long', day: 'numeric'
  });
}

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}