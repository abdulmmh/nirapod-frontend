import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardStats,
  RecentTaxpayer,
  RecentPayment,
  DashboardChartData,
} from 'src/app/models/dashboard.model';
import { FiscalYear } from 'src/app/models/fiscal-year.model';

declare global {
  interface CanvasRenderingContext2D {
    roundRect(
      x: number,
      y: number,
      w: number,
      h: number,
      radii: number | number[],
    ): void;
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
})
export class DashboardHomeComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private destroy$ = new Subject<void>();

  currentUser: any;
  currentDate = new Date();
  selectedYear = '2024-25';
  isRefreshing = false;
  isLoading = true;
  hasError = false;
  

  years = ['2024-25', '2023-24', '2022-23']; // fallback until API loads

  // ── Fiscal Years ──
  fiscalYears: FiscalYear[] = [];
  currentFiscalYear: FiscalYear | null = null;

  // ── Stat Cards ──
  statCards = [
    {
      label: 'Total Taxpayers',
      value: 0,
      change: 0,
      icon: 'bi bi-people-fill',
      color: 'teal',
      progress: 0,
      suffix: '',
    },
    {
      label: 'Total Revenue',
      value: 0,
      change: 0,
      icon: 'bi bi-currency-dollar',
      color: 'blue',
      progress: 0,
      suffix: ' Cr',
    },
    {
      label: 'VAT Returns',
      value: 0,
      change: 0,
      icon: 'bi bi-arrow-repeat',
      color: 'purple',
      progress: 0,
      suffix: '',
    },
    {
      label: 'Total Payments',
      value: 0,
      change: 0,
      icon: 'bi bi-credit-card-fill',
      color: 'green',
      progress: 0,
      suffix: '',
    },
    {
      label: 'Pending Audits',
      value: 0,
      change: 0,
      icon: 'bi bi-shield-fill-check',
      color: 'orange',
      progress: 0,
      suffix: '',
    },
    {
      label: 'Pending Refunds',
      value: 0,
      change: 0,
      icon: 'bi bi-cash-stack',
      color: 'red',
      progress: 0,
      suffix: '',
    },
  ];

  // ── VAT Collection Trend ──
  vatMonths: string[] = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  vatData: number[] = [32, 41, 38, 52, 47, 61];
  vatTarget: number[] = [40, 40, 45, 50, 50, 58];
  vatMax = 70;

  // ── Payment Collection ──
  payMonths: string[] = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  payData: number[] = [28, 35, 31, 44, 39, 53];
  payMax = 60;

  // ── Compliance Gauge ──
  complianceRate = 74;
  complianceFiled = 0;
  compliancePending = 0;

  // ── Zone-wise Collection (static — no backend endpoint yet) ──
  zones = [
    {
      name: 'VAT Zone-1 (Dhaka)',
      collection: 18.5,
      target: 20,
      color: '#1faa8b',
    },
    {
      name: 'VAT Zone-2 (Chittagong)',
      collection: 12.3,
      target: 15,
      color: '#1a3f8f',
    },
    {
      name: 'VAT Zone-3 (Rajshahi)',
      collection: 7.8,
      target: 10,
      color: '#7c3aed',
    },
    {
      name: 'VAT Zone-4 (Sylhet)',
      collection: 5.1,
      target: 8,
      color: '#f59e0b',
    },
    {
      name: 'VAT Zone-5 (Khulna)',
      collection: 4.2,
      target: 7,
      color: '#0891b2',
    },
  ];

  // ── Recent Taxpayers ──
  recentTaxpayers: Array<{
    name: string;
    tin: string;
    type: string;
    date: string;
    status: string;
  }> = [];

  // ── Recent Payments ──
  recentPayments: Array<{
    ref: string;
    taxpayer: string;
    amount: number;
    type: string;
    date: string;
    status: string;
  }> = [];

  // ── Tax Type Breakdown (static — no breakdown endpoint yet) ──
  taxBreakdown = [
    { label: 'VAT', value: 28.2, percentage: 61, color: '#1faa8b' },
    { label: 'Income Tax', value: 12.4, percentage: 27, color: '#1a3f8f' },
    { label: 'Import Duty', value: 3.8, percentage: 8, color: '#7c3aed' },
    { label: 'AIT', value: 0.9, percentage: 2, color: '#f59e0b' },
    { label: 'Others', value: 0.6, percentage: 2, color: '#0891b2' },
  ];

  // ── Quick Actions ──
  quickActions = [
    {
      label: 'New Taxpayer',
      icon: 'bi bi-person-plus-fill',
      route: '/taxpayers/create',
      color: 'teal',
    },
    {
      label: 'File VAT Return',
      icon: 'bi bi-arrow-repeat',
      route: '/vat-returns/create',
      color: 'blue',
    },
    {
      label: 'New Payment',
      icon: 'bi bi-credit-card-fill',
      route: '/payments/create',
      color: 'green',
    },
    {
      label: 'Issue Notice',
      icon: 'bi bi-bell-fill',
      route: '/notices/create',
      color: 'orange',
    },
    {
      label: 'New Audit',
      icon: 'bi bi-shield-fill-check',
      route: '/audits/create',
      color: 'purple',
    },
    {
      label: 'View Reports',
      icon: 'bi bi-bar-chart-fill',
      route: '/reports',
      color: 'navy',
    },
  ];

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private toast: ToastService,
  ) {}

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Initial draw (data may not be ready yet; loadDashboard will call again when done)
    setTimeout(() => this.redrawAllCharts(), 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────────────────────────────────
  // Data Loading — wired to DashboardService
  // ─────────────────────────────────────────────

  private loadDashboard(): void {
    this.isLoading = true;
    this.hasError = false;

    this.dashboardService
      .loadAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: ([
          stats,
          taxpayers,
          payments,
          chartData,
          ,
          ,
          ,
          ,
          fiscalYears,
        ]) => {
          this.applyStats(stats as DashboardStats);
          this.applyTaxpayers(taxpayers as RecentTaxpayer[]);
          this.applyPayments(payments as RecentPayment[]);
          this.applyChartData(chartData as DashboardChartData);
          this.applyFiscalYears(fiscalYears as FiscalYear[]);
          // Redraw charts after Angular binds the new data
          setTimeout(() => this.redrawAllCharts(), 50);
        },
        error: () => {
          this.hasError = true;
          this.toast.error(
            'Failed to load dashboard data. Please try refreshing.',
          );
        },
      });
  }

  // ── FiscalYear[] → dropdown + current year card ──
  private applyFiscalYears(list: FiscalYear[]): void {
    if (!list?.length) return;
    // Sort: Active first, then Upcoming, then Closed — within each by yearName desc
    this.fiscalYears = [...list].sort((a, b) => {
      const order: Record<string, number> = {
        Active: 0,
        Upcoming: 1,
        Closed: 2,
      };
      const diff = (order[a.status] ?? 3) - (order[b.status] ?? 3);
      return diff !== 0 ? diff : b.yearName.localeCompare(a.yearName);
    });
    this.currentFiscalYear =
      this.fiscalYears.find((y) => y.isCurrentYear) ?? this.fiscalYears[0];
    if (this.currentFiscalYear) {
      this.selectedYear = this.currentFiscalYear.yearName;
    }
  }

  isDatePast(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  // ── DashboardStats → statCards + gauge ──
  private applyStats(stats: DashboardStats): void {
    const revenueInCr = +(stats.totalRevenue / 10_000_000).toFixed(1);

    this.statCards[0].value = stats.totalTaxpayers;
    this.statCards[0].change = stats.taxpayerGrowth;

    this.statCards[1].value = revenueInCr;
    this.statCards[1].change = stats.revenueGrowth;

    this.statCards[2].value = stats.totalVatReturns;
    this.statCards[2].change = stats.vatReturnGrowth;

    this.statCards[3].value = stats.totalPayments;
    this.statCards[3].change = stats.paymentGrowth;

    this.statCards[4].value = stats.pendingAudits;
    this.statCards[4].change = stats.auditGrowth ?? -3.1;

    this.statCards[5].value = stats.pendingRefunds;
    this.statCards[5].change = -5.2;

    // Compliance gauge
    const totalFiled = stats.completedAudits ?? stats.totalVatReturns;
    const totalAll = totalFiled + (stats.pendingAudits ?? 0);
    this.complianceRate =
      totalAll > 0 ? Math.round((totalFiled / totalAll) * 100) : 74;
    this.complianceFiled = totalFiled;
    this.compliancePending = stats.pendingAudits ?? 0;

    // Normalised progress rings
    this.statCards[0].progress = Math.min(
      100,
      Math.round((stats.totalTaxpayers / 30_000) * 100),
    );
    this.statCards[1].progress = Math.min(
      100,
      Math.round((revenueInCr / 600) * 100),
    );
    this.statCards[2].progress = Math.min(
      100,
      Math.round((stats.totalVatReturns / 20_000) * 100),
    );
    this.statCards[3].progress = Math.min(
      100,
      Math.round((stats.totalPayments / 40_000) * 100),
    );
    this.statCards[4].progress = Math.min(
      100,
      Math.round((stats.pendingAudits / 500) * 100),
    );
    this.statCards[5].progress = Math.min(
      100,
      Math.round((stats.pendingRefunds / 200) * 100),
    );
  }

  // ── RecentTaxpayer[] → display list ──
  private applyTaxpayers(list: RecentTaxpayer[]): void {
    this.recentTaxpayers = (list || []).slice(0, 5).map((t) => ({
      name: t.fullName,
      tin: t.tin,
      type: 'Company', // extend backend model to expose type when ready
      date: t.registrationDate,
      status: t.status,
    }));
  }

  // ── RecentPayment[] → display list ──
  private applyPayments(list: RecentPayment[]): void {
    this.recentPayments = (list || []).slice(0, 5).map((p) => ({
      ref: p.transactionId,
      taxpayer: p.taxpayerName,
      amount: p.amount,
      type: p.paymentType,
      date: p.paymentDate,
      // backend sends 'Completed'; CSS class expects 'Cleared'
      status: p.status === 'Completed' ? 'Cleared' : p.status,
    }));
  }

  // ── DashboardChartData → chart arrays ──
  private applyChartData(data: DashboardChartData): void {
    if (data?.vatChart?.length) {
      this.vatMonths = data.vatChart.map((d) => d.label);
      // Backend stores raw BDT values → convert to Lakh for display
      this.vatData = data.vatChart.map((d) => +(d.value / 100_000).toFixed(1));
      this.vatMax = Math.ceil(Math.max(...this.vatData) * 1.25) || 70;
    }

    if (data?.paymentChart?.length) {
      this.payMonths = data.paymentChart.map((d) => d.label);
      this.payData = data.paymentChart.map(
        (d) => +(d.value / 100_000).toFixed(1),
      );
      this.payMax = Math.ceil(Math.max(...this.payData) * 1.25) || 60;
    }
  }

  // ─────────────────────────────────────────────
  // UI Events
  // ─────────────────────────────────────────────

  onRefresh(): void {
    this.isRefreshing = true;
    this.loadDashboard();
    setTimeout(() => {
      this.isRefreshing = false;
      if (!this.hasError) this.toast.success('Dashboard refreshed.');
    }, 1200);
  }

  onYearChange(): void {
    this.loadDashboard();
  }

  // ─────────────────────────────────────────────
  // Template Helpers
  // ─────────────────────────────────────────────

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  formatValue(v: number, suffix: string): string {
    if (suffix === ' Cr') return `${v}`;
    if (v >= 1000) return v.toLocaleString();
    return v.toString();
  }

  getZonePercent(z: any): number {
    return Math.round((z.collection / z.target) * 100);
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Pending: 'status-pending',
      Cleared: 'status-active',
      Completed: 'status-active',
      Inactive: 'status-inactive',
      Suspended: 'status-inactive',
      Failed: 'status-inactive',
    };
    return map[s] ?? '';
  }

  formatCurrency(a: number): string {
    if (a >= 100_000) return `৳${(a / 100_000).toFixed(2)}L`;
    return `৳${a.toLocaleString('en-BD')}`;
  }

  // ─────────────────────────────────────────────
  // Canvas Drawing
  // ─────────────────────────────────────────────

  private redrawAllCharts(): void {
    this.drawGauge();
    this.drawVatChart();
    this.drawPayChart();
    this.drawDonut();
  }

  private setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    return ctx;
  }

  drawGauge(): void {
    const canvas = document.getElementById('gaugeCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = this.setupCanvas(canvas);
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height * 0.75;
    const r = 90;
    const start = Math.PI;
    const val = start + (this.complianceRate / 100) * Math.PI;
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, 2 * Math.PI);
    ctx.strokeStyle = '#eef2f8';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, '#e74c3c');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#1faa8b');
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, val);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.fillStyle = '#1a2340';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.complianceRate}%`, cx, cy - 10);
    ctx.fillStyle = '#888';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Compliance Rate', cx, cy + 12);
    ctx.fillStyle = '#aaa';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('0%', cx - r - 10, cy + 20);
    ctx.textAlign = 'right';
    ctx.fillText('100%', cx + r + 10, cy + 20);
  }

  drawVatChart(): void {
    const canvas = document.getElementById('vatChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = this.setupCanvas(canvas);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width,
      h = rect.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 45 };
    const cw = w - pad.left - pad.right,
      ch = h - pad.top - pad.bottom;
    ctx.clearRect(0, 0, w, h);

    const drawLine = (data: number[], color: string, fill: boolean) => {
      const pts = data.map((v, i) => ({
        x: pad.left + (i / (data.length - 1)) * cw,
        y: pad.top + ch - (v / this.vatMax) * ch,
      }));
      if (fill) {
        const g = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
        g.addColorStop(0, color + '40');
        g.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pad.top + ch);
        pts.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, pad.top + ch);
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        ctx.bezierCurveTo(
          mx,
          pts[i].y,
          mx,
          pts[i + 1].y,
          pts[i + 1].x,
          pts[i + 1].y,
        );
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + cw, y);
      ctx.strokeStyle = '#f0f4f8';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#aaa';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        `${Math.round(this.vatMax - (this.vatMax / 4) * i)}`,
        pad.left - 6,
        y + 4,
      );
    }
    this.vatMonths.forEach((m, i) => {
      const x = pad.left + (i / (this.vatMonths.length - 1)) * cw;
      ctx.fillStyle = '#aaa';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m, x, h - 10);
    });
    drawLine(this.vatTarget, '#e0e8f9', false);
    drawLine(this.vatData, '#1faa8b', true);
  }

  drawPayChart(): void {
    const canvas = document.getElementById('payChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = this.setupCanvas(canvas);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width,
      h = rect.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 45 };
    const cw = w - pad.left - pad.right,
      ch = h - pad.top - pad.bottom;
    ctx.clearRect(0, 0, w, h);
    const barW = cw / (this.payData.length * 2);
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + cw, y);
      ctx.strokeStyle = '#f0f4f8';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#aaa';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        `${Math.round(this.payMax - (this.payMax / 4) * i)}`,
        pad.left - 6,
        y + 4,
      );
    }
    this.payData.forEach((v, i) => {
      const x = pad.left + (i / (this.payData.length - 1)) * cw - barW / 2;
      const bh = (v / this.payMax) * ch;
      const y = pad.top + ch - bh;
      const g = ctx.createLinearGradient(0, y, 0, pad.top + ch);
      g.addColorStop(0, '#1a3f8f');
      g.addColorStop(1, '#1a3f8f30');
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(x, y, barW, bh, [4, 4, 0, 0])
        : ctx.rect(x, y, barW, bh);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.fillStyle = '#aaa';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.payMonths[i], x + barW / 2, h - 10);
    });
  }

  drawDonut(): void {
    const canvas = document.getElementById('donutChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = this.setupCanvas(canvas);
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2,
      cy = rect.height / 2;
    ctx.clearRect(0, 0, rect.width, rect.height);
    let angle = -Math.PI / 2;
    this.taxBreakdown.forEach((t) => {
      const slice = (t.percentage / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 80, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = t.color;
      ctx.fill();
      angle += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    const totalCr = this.statCards[1].value;
    ctx.fillStyle = '#1a2340';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`৳${totalCr}`, cx, cy - 4);
    ctx.fillStyle = '#888';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Crore Total', cx, cy + 12);
  }
}
