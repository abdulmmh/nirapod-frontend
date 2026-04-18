import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

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
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  currentUser: any;
  currentDate = new Date();
  selectedYear = '2024-25';
  isRefreshing = false;

  years = ['2024-25', '2023-24', '2022-23'];

  // ── Stat Cards ──
  statCards = [
    {
      label: 'Total Taxpayers',
      value: 24850,
      change: 12.5,
      icon: 'bi bi-people-fill',
      color: 'teal',
      progress: 75,
      suffix: '',
    },
    {
      label: 'Total Revenue',
      value: 4590,
      change: 8.3,
      icon: 'bi bi-currency-dollar',
      color: 'blue',
      progress: 83,
      suffix: ' Cr',
    },
    {
      label: 'VAT Returns',
      value: 15640,
      change: 15.2,
      icon: 'bi bi-arrow-repeat',
      color: 'purple',
      progress: 62,
      suffix: '',
    },
    {
      label: 'Total Payments',
      value: 32100,
      change: 9.7,
      icon: 'bi bi-credit-card-fill',
      color: 'green',
      progress: 88,
      suffix: '',
    },
    {
      label: 'Pending Audits',
      value: 142,
      change: -3.1,
      icon: 'bi bi-shield-fill-check',
      color: 'orange',
      progress: 28,
      suffix: '',
    },
    {
      label: 'Pending Refunds',
      value: 89,
      change: -5.2,
      icon: 'bi bi-cash-stack',
      color: 'red',
      progress: 18,
      suffix: '',
    },
  ];

  // ── VAT Collection Trend ──
  vatMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  vatData = [32, 41, 38, 52, 47, 61];
  vatTarget = [40, 40, 45, 50, 50, 58];
  vatMax = 70;

  // ── Payment Collection ──
  payMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  payData = [28, 35, 31, 44, 39, 53];
  payMax = 60;

  // ── Compliance Gauge ──
  complianceRate = 74;

  // ── Zone-wise Collection ──
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
  recentTaxpayers = [
    {
      name: 'Rahman Textile Ltd.',
      tin: 'TIN-1001',
      type: 'Company',
      date: '2026-04-01',
      status: 'Active',
    },
    {
      name: 'Karim Traders',
      tin: 'TIN-1002',
      type: 'Sole Prop',
      date: '2026-03-30',
      status: 'Active',
    },
    {
      name: 'BD Tech Solutions',
      tin: 'TIN-1006',
      type: 'Company',
      date: '2026-03-28',
      status: 'Active',
    },
    {
      name: 'Dhaka Pharma Co.',
      tin: 'TIN-1003',
      type: 'Company',
      date: '2026-03-25',
      status: 'Pending',
    },
    {
      name: 'Chittagong Exports',
      tin: 'TIN-1004',
      type: 'Partner',
      date: '2026-03-20',
      status: 'Active',
    },
  ];

  // ── Recent Payments ──
  recentPayments = [
    {
      ref: 'PAY-2024-001',
      taxpayer: 'Rahman Textile Ltd.',
      amount: 450000,
      type: 'VAT',
      date: '2026-04-01',
      status: 'Cleared',
    },
    {
      ref: 'PAY-2024-002',
      taxpayer: 'BD Tech Solutions',
      amount: 287500,
      type: 'Income Tax',
      date: '2026-04-01',
      status: 'Cleared',
    },
    {
      ref: 'PAY-2024-003',
      taxpayer: 'Karim Traders',
      amount: 105000,
      type: 'VAT',
      date: '2026-03-30',
      status: 'Pending',
    },
    {
      ref: 'PAY-2024-004',
      taxpayer: 'Chittagong Exports',
      amount: 650000,
      type: 'Import Duty',
      date: '2026-03-28',
      status: 'Cleared',
    },
    {
      ref: 'PAY-2024-005',
      taxpayer: 'Dhaka Pharma Co.',
      amount: 195000,
      type: 'AIT',
      date: '2026-03-25',
      status: 'Pending',
    },
  ];

  // ── Tax Type Breakdown ──
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

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.drawGauge();
      this.drawVatChart();
      this.drawPayChart();
      this.drawDonut();
    }, 50);
  }

  private setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set actual pixel size = CSS size × device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Keep CSS display size the same
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Scale context so drawings are sharp
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    return ctx;
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  formatValue(v: number, suffix: string): string {
    if (suffix === ' Cr') return `৳${v}`;
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
      Inactive: 'status-inactive',
    };
    return map[s] ?? '';
  }

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString('en-BD')}`;
  }

  onRefresh(): void {
    this.isRefreshing = true;
    setTimeout(() => {
      this.isRefreshing = false;
      this.drawGauge();
      this.drawVatChart();
      this.drawPayChart();
      this.drawDonut();
    }, 1200);
  }

  // ── Canvas Drawing ──

  drawGauge(): void {
    const canvas = document.getElementById('gaugeCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = this.setupCanvas(canvas);
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height * 0.75;
    const r = 90;
    const start = Math.PI;
    const end = 2 * Math.PI;
    const val = start + (this.complianceRate / 100) * Math.PI;

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.strokeStyle = '#eef2f8';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc — gradient
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

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, r - 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Text
    ctx.fillStyle = '#1a2340';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.complianceRate}%`, cx, cy - 10);
    ctx.fillStyle = '#888';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Compliance Rate', cx, cy + 12);

    // Min/Max labels
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
    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 45 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    const drawLine = (data: number[], color: string, fill: boolean) => {
      const pts = data.map((v, i) => ({
        x: pad.left + (i / (data.length - 1)) * cw,
        y: pad.top + ch - (v / this.vatMax) * ch,
      }));

      if (fill) {
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
        grad.addColorStop(0, color + '40');
        grad.addColorStop(1, color + '00');

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pad.top + ch);
        pts.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, pad.top + ch);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Smooth line
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

      // Dots
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

    // Grid lines
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

    // X labels
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
    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 45 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    const barW = cw / (this.payData.length * 2);

    // Grid
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

      const grad = ctx.createLinearGradient(0, y, 0, pad.top + ch);
      grad.addColorStop(0, '#1a3f8f');
      grad.addColorStop(1, '#1a3f8f30');

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barW, bh, [4, 4, 0, 0]);
      } else {
        ctx.rect(x, y, barW, bh);
      }
      ctx.fillStyle = grad;
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
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const r = 80;
    const ir = 55;

    ctx.clearRect(0, 0, rect.width, rect.height);

    let startAngle = -Math.PI / 2;

    this.taxBreakdown.forEach((t) => {
      const slice = (t.percentage / 100) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = t.color;
      ctx.fill();

      startAngle += slice;
    });

    // Inner circle (donut hole)
    ctx.beginPath();
    ctx.arc(cx, cy, ir, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#1a2340';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('৳45.9', cx, cy - 4);
    ctx.fillStyle = '#888';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Crore Total', cx, cy + 12);
  }
}
