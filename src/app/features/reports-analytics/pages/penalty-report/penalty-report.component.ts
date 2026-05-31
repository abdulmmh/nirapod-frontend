import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../service/reports.service';
import { PenaltyReportRow } from '../../model/report.model';

@Component({
  selector: 'app-penalty-report',
  templateUrl: './penalty-report.component.html',
  styleUrls: ['./penalty-report.component.css'],
})
export class PenaltyReportComponent implements OnInit, OnDestroy {

  rows: PenaltyReportRow[] = [];
  isLoading = false;
  totalElements = 0;
  totalPages = 0;

  fiscalYear = '';
  activeStatus = '';
  activeSeverity = '';
  searchTerm = '';
  page = 0;
  size = 20;

  statusFilters = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Waived', value: 'WAIVED' },
    { label: 'Disputed', value: 'DISPUTED' },
  ];

  severityFilters = [
    { label: 'All Severity', value: '' },
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportsService: ReportsService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.fiscalYear = params['fiscalYear'] || '';
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this.reportsService
      .getPenaltyReport(
        this.fiscalYear, this.activeSeverity,
        this.activeStatus, this.page, this.size)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.rows          = res.content;
          this.totalElements = res.totalElements;
          this.totalPages    = res.totalPages;
        },
        error: () => { this.rows = []; },
      });
  }

  filterByStatus(status: string): void {
    this.activeStatus = status;
    this.page = 0;
    this.loadData();
  }

  filterBySeverity(sev: string): void {
    this.activeSeverity = sev;
    this.page = 0;
    this.loadData();
  }

  get filteredRows(): PenaltyReportRow[] {
    if (!this.searchTerm.trim()) return this.rows;
    const q = this.searchTerm.toLowerCase();
    return this.rows.filter(r =>
      r.penaltyRefNo?.toLowerCase().includes(q) ||
      r.taxpayerName?.toLowerCase().includes(q) ||
      r.tinNumber?.toLowerCase().includes(q)
    );
  }

  get pageRange(): number[] {
    const start = this.page * this.size + 1;
    const end   = Math.min(start + this.size - 1, this.totalElements);
    return [start, end];
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadData(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadData(); } }
  goBack(): void { this.router.navigate(['/reports']); }

  exportCsv(): void {
    this.reportsService.exportReport('csv', {
      reportType: 'PENALTY_COLLECTION',
      fiscalYear: this.fiscalYear,
    }).pipe(takeUntil(this.destroy$)).subscribe(blob => {
      this.reportsService.triggerBlobDownload(
        blob, `Penalty_${this.fiscalYear}.csv`);
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':     return 'status-active';
      case 'PENDING':  return 'status-pending';
      case 'WAIVED':   return 'status-draft';
      case 'DISPUTED': return 'status-rejected';
      default:         return 'status-pending';
    }
  }

  getSeverityClass(sev: string): string {
    switch (sev?.toUpperCase()) {
      case 'LOW':      return 'sev-low';
      case 'MEDIUM':   return 'sev-medium';
      case 'HIGH':     return 'sev-high';
      case 'CRITICAL': return 'sev-critical';
      default:         return 'sev-low';
    }
  }

  formatAmount(v: number | null | undefined): string {
    if (!v) return '৳0.00';
    return '৳' + v.toLocaleString('en-BD', { minimumFractionDigits: 2 });
  }
}