import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../service/reports.service';
import { RefundReportRow } from '../../model/report.model';

@Component({
  selector: 'app-refund-report',
  templateUrl: './refund-report.component.html',
  styleUrls: ['./refund-report.component.css'],
})
export class RefundReportComponent implements OnInit, OnDestroy {

  rows: RefundReportRow[] = [];
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
    { label: 'Submitted',    value: 'SUBMITTED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved',     value: 'APPROVED' },
    { label: 'Paid',         value: 'PAID' },
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
      .getRefundReport(this.fiscalYear, this.activeStatus, this.page, this.size)
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

  get filteredRows(): RefundReportRow[] {
    if (!this.searchTerm.trim()) return this.rows;
    const q = this.searchTerm.toLowerCase();
    return this.rows.filter(r =>
      r.refundRefNo?.toLowerCase().includes(q) ||
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
      reportType: 'REFUND_STATUS',
      fiscalYear: this.fiscalYear,
    }).pipe(takeUntil(this.destroy$)).subscribe(blob => {
      this.reportsService.triggerBlobDownload(
        blob, `Refund_${this.fiscalYear}.csv`);
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':         return 'status-active';
      case 'APPROVED':     return 'status-approved';
      case 'SUBMITTED':    return 'status-pending';
      case 'UNDER_REVIEW': return 'status-review';
      case 'REJECTED':     return 'status-rejected';
      default:             return 'status-pending';
    }
  }

  formatAmount(v: number | null | undefined): string {
    if (!v) return '৳0.00';
    return '৳' + v.toLocaleString('en-BD', { minimumFractionDigits: 2 });
  }
}