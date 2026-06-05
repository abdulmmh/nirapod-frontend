import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../service/reports.service';

/**
 * ImportDutyReportComponent — UPDATED for Gap B.
 *
 * Previously used generic /api/import-duty endpoint (no fiscal year filter).
 * Now uses /api/reports/import-duty with createdAt year-range filtering.
 *
 * REPLACE your existing import-duty-report.component.ts with this file.
 */
@Component({
  selector: 'app-import-duty-report',
  templateUrl: './import-duty-report.component.html',
  styleUrls: ['./import-duty-report.component.css'],
})
export class ImportDutyReportComponent implements OnInit, OnDestroy {

  rows: any[] = [];
  isLoading = false;
  totalElements = 0;
  totalPages = 0;

  fiscalYear = '';
  activeStatus = '';
  searchTerm = '';
  page = 0;
  size = 20;

  statusFilters = [
    { label: 'All',          value: '' },
    { label: 'Pending',      value: 'PENDING' },
    { label: 'Cleared',      value: 'CLEARED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Rejected',     value: 'REJECTED' },
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
      .getImportDutyReport(
        this.fiscalYear, this.activeStatus, this.page, this.size)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.rows          = res.content || [];
          this.totalElements = res.totalElements || 0;
          this.totalPages    = res.totalPages || 1;
        },
        error: () => { this.rows = []; },
      });
  }

  filterByStatus(status: string): void {
    this.activeStatus = status;
    this.page = 0;
    this.loadData();
  }

  get filteredRows(): any[] {
    if (!this.searchTerm.trim()) return this.rows;
    const q = this.searchTerm.toLowerCase();
    return this.rows.filter((r: any) =>
      r.dutyRef?.toLowerCase().includes(q) ||
      r.taxpayerName?.toLowerCase().includes(q) ||
      r.tinNumber?.toLowerCase().includes(q) ||
      r.portOfEntry?.toLowerCase().includes(q) ||
      r.boeNumber?.toLowerCase().includes(q)
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

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CLEARED':      return 'status-active';
      case 'PENDING':      return 'status-pending';
      case 'UNDER_REVIEW': return 'status-review';
      case 'REJECTED':     return 'status-rejected';
      default:             return 'status-pending';
    }
  }

  formatAmount(v: any): string {
    if (!v) return '৳0.00';
    return '৳' + Number(v).toLocaleString('en-BD', { minimumFractionDigits: 2 });
  }
}
