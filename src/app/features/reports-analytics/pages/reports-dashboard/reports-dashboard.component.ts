import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import { ReportsService } from '../../service/reports.service';
import {
  KpiSummary,
  TrendPoint,
  ComplianceData,
  ReportFilter,
} from '../../model/report.model';
import { TaxZone, TaxCircle } from 'src/app/models/master-data.model';
import { FiscalYear } from 'src/app/models/fiscal-year.model';

interface ReportCard {
  title: string;
  desc: string;
  icon: string;
  color: string;
  count: string;
  reportType: string;
  route: string;
  downloading: boolean;
}

interface BreakdownItem {
  label: string;
  pct: number;
  color: string;
}

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.css'],
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  // ─── State ────────────────────────────────────────────────────────────────
  kpi: KpiSummary | null = null;
  kpiLoading = true;
  trendData: TrendPoint[] = [];
  trendLoading = false;
  trendMonths = 12;
  complianceData: ComplianceData[] = [];
  errorMsg = '';
  isExportingAll = false;

  // ─── Filter State ─────────────────────────────────────────────────────────
  filters: ReportFilter = {
    fiscalYear: '',
    zone: '',
    circle: '',
    taxType: '',
  };

  fiscalYears: FiscalYear[] = [];
  zones: TaxZone[] = [];
  circles: TaxCircle[] = [];

  // ─── Chart properties ────────────────────────────────────────────
  trendChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'VAT',
        data: [],
        borderColor: '#0891b2',
        backgroundColor: 'rgba(8,145,178,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Income Tax',
        data: [],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Import Duty',
        data: [],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231,76,60,0.08)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  trendChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 } } },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: {
          callback: (val) => '৳' + (Number(val) / 10000000).toFixed(1) + 'Cr',
        },
      },
    },
  };

  breakdownChartData: ChartData<'doughnut'> = {
    labels: ['VAT', 'Income Tax', 'Import Duty', 'AIT'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#0891b2', '#7c3aed', '#e74c3c', '#1a3f8f'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  breakdownChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 } } },
    },
    cutout: '65%',
  };

  // ─── Report Cards ─────────────────────────────────────────────────────────
  reportCards: ReportCard[] = [
    {
      title: 'VAT Collection Report',
      desc: 'Monthly VAT collection summary by zone and circle',
      icon: 'bi bi-receipt-cutoff',
      color: 'teal',
      count: '—',
      reportType: 'VAT_COLLECTION',
      route: 'vat-collection',
      downloading: false,
    },
    {
      title: 'Income Tax Returns Report',
      desc: 'ITR filing status and tax collection analysis',
      icon: 'bi bi-file-earmark-text-fill',
      color: 'purple',
      count: '—',
      reportType: 'INCOME_TAX',
      route: 'income-tax',
      downloading: false,
    },
    {
      title: 'Import Duty Report',
      desc: 'Import duty assessments and clearances by port',
      icon: 'bi bi-truck-front-fill',
      color: 'red',
      count: '—',
      reportType: 'IMPORT_DUTY',
      route: 'import-duty',
      downloading: false,
    },
    {
      title: 'AIT Deduction Report',
      desc: 'Advance income tax deductions by source type',
      icon: 'bi bi-percent',
      color: 'blue',
      count: '—',
      reportType: 'AIT_DEDUCTION',
      route: 'ait-report',
      downloading: false,
    },
    {
      title: 'Penalty Collection Report',
      desc: 'Penalty and fine collections with status breakdown',
      icon: 'bi bi-exclamation-triangle-fill',
      color: 'orange',
      count: '—',
      reportType: 'PENALTY_COLLECTION',
      route: 'penalty-report',
      downloading: false,
    },
    {
      title: 'Refund Status Report',
      desc: 'Pending and completed refund claims analysis',
      icon: 'bi bi-arrow-return-left',
      color: 'green',
      count: '—',
      reportType: 'REFUND_STATUS',
      route: 'refund-report',
      downloading: false,
    },
  ];

  get taxBreakdownItems(): BreakdownItem[] {
    if (!this.kpi) return [];
    const total =
      (this.kpi.vatCollected || 0) +
      (this.kpi.incomeTaxCollected || 0) +
      (this.kpi.importDutyCollected || 0) +
      (this.kpi.aitDeducted || 0);
    if (!total) return [];
    return [
      {
        label: 'VAT',
        pct: (this.kpi.vatCollected / total) * 100,
        color: '#0891b2',
      },
      {
        label: 'Income Tax',
        pct: (this.kpi.incomeTaxCollected / total) * 100,
        color: '#7c3aed',
      },
      {
        label: 'Import Duty',
        pct: (this.kpi.importDutyCollected / total) * 100,
        color: '#e74c3c',
      },
      {
        label: 'AIT',
        pct: (this.kpi.aitDeducted / total) * 100,
        color: '#1a3f8f',
      },
    ];
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.zone || this.filters.circle || this.filters.taxType);
  }

  private destroy$ = new Subject<void>();

  constructor(
    private reportsService: ReportsService,
    private masterDataService: MasterDataService,
    private toast: ToastService,
    private router: Router,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadMasterData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────

  private loadMasterData(): void {
    forkJoin({
      fiscalYears: this.masterDataService.getFiscalYears(),
      zones: this.masterDataService.getTaxZones(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ fiscalYears, zones }) => {
          this.fiscalYears = fiscalYears;
          this.zones = zones;
          if (fiscalYears.length > 0) {
            const current =
              fiscalYears.find((f) => f.isCurrentYear) || fiscalYears[0];
            this.filters.fiscalYear = current.yearName;
          }
          this.loadData();
        },
        error: () => {
          this.errorMsg = 'Failed to load master data. Please refresh.';
          this.kpiLoading = false;
        },
      });
  }

  loadData(): void {
    this.errorMsg = '';
    this.loadKpi();
    this.loadTrendData();
    this.loadComplianceData();
  }

  private loadKpi(): void {
    this.kpiLoading = true;
    this.reportsService
      .getKpiSummary(
        this.filters.fiscalYear,
        this.filters.zone,
        this.filters.circle,
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.kpiLoading = false)),
      )
      .subscribe({
        next: (kpi) => {
          this.kpi = kpi;
          if (kpi) {
            this.breakdownChartData = {
              ...this.breakdownChartData,
              datasets: [
                {
                  ...this.breakdownChartData.datasets[0],
                  data: [
                    Number(kpi.vatCollected),
                    Number(kpi.incomeTaxCollected),
                    Number(kpi.importDutyCollected),
                    Number(kpi.aitDeducted),
                  ],
                },
              ],
            };
          }
          this.updateReportCardCounts(kpi);
        },
        error: () => {
          this.errorMsg = 'Failed to load KPI data. Please try again.';
        },
      });
  }

  loadTrendData(): void {
    this.trendLoading = true;
    this.reportsService
      .getRevenueTrend(this.filters.fiscalYear, this.trendMonths)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.trendLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.trendData = data;
          this.trendChartData = {
            labels: data.map((d) => d.label),
            datasets: [
              {
                ...this.trendChartData.datasets[0],
                data: data.map((d) => Number(d.vatAmount)),
              },
              {
                ...this.trendChartData.datasets[1],
                data: data.map((d) => Number(d.itAmount)),
              },
              {
                ...this.trendChartData.datasets[2],
                data: data.map((d) => Number(d.importDutyAmount)),
              },
            ],
          };
          // TODO: render Chart.js line chart on trendCanvas with data
        },
        error: () => {
          this.trendData = [];
        },
      });
  }

  private loadComplianceData(): void {
    this.reportsService
      .getComplianceRate(this.filters.fiscalYear, this.filters.zone)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.complianceData = data),
        error: () => (this.complianceData = []),
      });
  }

  private updateReportCardCounts(kpi: KpiSummary): void {
    this.reportCards = this.reportCards.map((r) => {
      switch (r.reportType) {
        case 'VAT_COLLECTION':
          return {
            ...r,
            count: '৳' + this.formatCrore(kpi.vatCollected) + ' Cr',
          };
        case 'INCOME_TAX':
          return { ...r, count: kpi.filedReturns.toLocaleString() };
        case 'IMPORT_DUTY':
          return {
            ...r,
            count: '৳' + this.formatCrore(kpi.importDutyCollected) + ' Cr',
          };
        case 'AIT_DEDUCTION':
          return {
            ...r,
            count: '৳' + this.formatCrore(kpi.aitDeducted) + ' Cr',
          };
        case 'PENALTY_COLLECTION':
          return {
            ...r,
            count: '৳' + this.formatCrore(kpi.penaltyCollected) + ' Cr',
          };
        case 'REFUND_STATUS':
          return {
            ...r,
            count: '৳' + this.formatCrore(kpi.refundPaid) + ' Cr',
          };
        default:
          return r;
      }
    });
  }

  // ─── Filters ──────────────────────────────────────────────────────────────

  onZoneChange(): void {
    this.filters.circle = '';
    this.circles = [];
    if (this.filters.zone) {
      this.masterDataService
        .getTaxCirclesByZone(Number(this.filters.zone))
        .pipe(takeUntil(this.destroy$))
        .subscribe((circles) => (this.circles = circles));
    }
    this.loadData();
  }

  resetFilters(): void {
    const fy = this.filters.fiscalYear;
    this.filters = { fiscalYear: fy, zone: '', circle: '', taxType: '' };
    this.circles = [];
    this.loadData();
  }

  // ─── Navigation / Drill-down ──────────────────────────────────────────────

  drillDown(route: string): void {
    this.router.navigate(['/reports', route], {
      queryParams: {
        fiscalYear: this.filters.fiscalYear,
        zone: this.filters.zone || null,
        circle: this.filters.circle || null,
      },
    });
  }

  viewReport(route: string): void {
    this.drillDown(route);
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  downloadReport(reportType: string, event: MouseEvent): void {
    const card = this.reportCards.find((r) => r.reportType === reportType);
    if (!card) return;
    card.downloading = true;

    this.reportsService
      .exportReport('excel', {
        reportType,
        fiscalYear: this.filters.fiscalYear,
        zone: this.filters.zone || undefined,
        circle: this.filters.circle || undefined,
      })
      .pipe(
        finalize(() => (card.downloading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (blob) => {
          const filename = `${reportType}_${this.filters.fiscalYear}.xlsx`;
          this.reportsService.triggerBlobDownload(blob, filename);
          this.toast.success(
            `${card.title} downloaded successfully`,
            'success',
          );
        },
        error: () => {
          this.toast.error('Export failed. Please try again.', 'error');
        },
      });
  }

  exportAll(): void {
    this.isExportingAll = true;
    this.reportsService
      .exportReport('pdf', {
        reportType: 'ALL',
        fiscalYear: this.filters.fiscalYear,
        zone: this.filters.zone || undefined,
      })
      .pipe(
        finalize(() => (this.isExportingAll = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (blob) => {
          this.reportsService.triggerBlobDownload(
            blob,
            `NirapodFullReport_${this.filters.fiscalYear}.pdf`,
          );
          this.toast.success('Full report exported successfully', 'success');
        },
        error: () => {
          this.toast.error('Export failed. Please try again.', 'error');
        },
      });
  }

  // ─── Formatters ───────────────────────────────────────────────────────────

  formatCrore(value: number | null | undefined): string {
    if (!value) return '0.0';
    return (value / 10000000).toFixed(1);
  }
}
