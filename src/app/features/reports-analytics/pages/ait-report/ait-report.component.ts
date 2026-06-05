import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../service/reports.service';

/**
 * AitReportComponent — UPDATED for Gap B.
 *
 * Previously used generic /api/ait-records endpoint (no fiscal year filter).
 * Now uses proper /api/reports/ait-deduction endpoint with:
 *   - fiscalYear filter (via AitRecord.fiscalYear.yearName)
 *   - status filter
 *   - sourceType filter
 *   - TAXPAYER role scoping (backend handles it)
 *
 * REPLACE your existing ait-report.component.ts with this file.
 */
@Component({
  selector: 'app-ait-report',
  templateUrl: './ait-report.component.html',
  styleUrls: ['./ait-report.component.css'],
})
export class AitReportComponent implements OnInit, OnDestroy {

  rows: any[] = [];
  isLoading = false;
  totalElements = 0;
  totalPages = 0;

  fiscalYear = '';
  activeStatus = '';
  activeSourceType = '';
  searchTerm = '';
  page = 0;
  size = 20;

  statusFilters = [
    { label: 'All',          value: '' },
    { label: 'Pending',      value: 'PENDING' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved',     value: 'APPROVED' },
    { label: 'Credited',     value: 'CREDITED' },
    { label: 'Rejected',     value: 'REJECTED' },
  ];

  sourceTypeFilters = [
    { label: 'All Sources', value: '' },
    { label: 'Import',      value: 'IMPORT' },
    { label: 'Salary',      value: 'SALARY' },
    { label: 'Supplier',    value: 'SUPPLIER' },
    { label: 'Contractor',  value: 'CONTRACTOR' },
    { label: 'Rent',        value: 'RENT' },
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
    // Now calls proper report endpoint with fiscal year filter
    this.reportsService
      .getAitDeductionReport(
        this.fiscalYear, this.activeStatus,
        this.activeSourceType, this.page, this.size)
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

  filterBySourceType(type: string): void {
    this.activeSourceType = type;
    this.page = 0;
    this.loadData();
  }

  get filteredRows(): any[] {
    if (!this.searchTerm.trim()) return this.rows;
    const q = this.searchTerm.toLowerCase();
    return this.rows.filter((r: any) =>
      r.aitReferenceNo?.toLowerCase().includes(q) ||
      r.taxpayerName?.toLowerCase().includes(q) ||
      r.tinNumber?.toLowerCase().includes(q) ||
      r.sourceType?.toLowerCase().includes(q)
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
      case 'APPROVED':
      case 'CREDITED':     return 'status-active';
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
