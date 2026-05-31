import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../service/reports.service';
import { VatCollectionRow } from '../../model/report.model';

@Component({
  selector: 'app-vat-collection-report',
  templateUrl: './vat-collection-report.component.html',
  styleUrls: ['./vat-collection-report.component.css'],
})
export class VatCollectionReportComponent implements OnInit, OnDestroy {

  // ─── Data ─────────────────────────────────────────────────────────────────
  rows: VatCollectionRow[] = [];
  isLoading = false;
  totalElements = 0;
  totalPages = 0;

  // ─── Filters ──────────────────────────────────────────────────────────────
  fiscalYear = '';
  zone = '';
  circle = '';
  activeStatus = '';
  searchTerm = '';
  page = 0;
  size = 20;

  statusFilters = [
    { label: 'All', value: '' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Draft', value: 'Draft' },
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
      this.zone       = params['zone']       || '';
      this.circle     = params['circle']     || '';
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
      .getVatCollectionReport(
        this.fiscalYear, this.zone, this.circle,
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

  get filteredRows(): VatCollectionRow[] {
    if (!this.searchTerm.trim()) return this.rows;
    const q = this.searchTerm.toLowerCase();
    return this.rows.filter(r =>
      r.binNo?.toLowerCase().includes(q) ||
      r.businessName?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
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
      reportType: 'VAT_COLLECTION',
      fiscalYear: this.fiscalYear,
      zone: this.zone || undefined,
      circle: this.circle || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe(blob => {
      this.reportsService.triggerBlobDownload(
        blob, `VAT_Collection_${this.fiscalYear}.csv`);
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'status-active';
      case 'draft':     return 'status-draft';
      default:          return 'status-pending';
    }
  }

  formatAmount(v: number | null | undefined): string {
    if (!v) return '৳0.00';
    return '৳' + v.toLocaleString('en-BD', { minimumFractionDigits: 2 });
  }
}