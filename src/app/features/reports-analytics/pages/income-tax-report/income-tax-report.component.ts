import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../service/reports.service';
import { IncomeTaxRow } from '../../model/report.model';

@Component({
  selector: 'app-income-tax-report',
  templateUrl: './income-tax-report.component.html',
  styleUrls: ['./income-tax-report.component.css'],
})
export class IncomeTaxReportComponent implements OnInit, OnDestroy {

  rows: IncomeTaxRow[] = [];
  isLoading = false;
  totalElements = 0;
  totalPages = 0;

  fiscalYear = '';
  activeStatus = '';
  activeTaxpayerType = '';
  searchTerm = '';
  page = 0;
  size = 20;

  statusFilters = [
    { label: 'All', value: '' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Accepted', value: 'Accepted' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Draft', value: 'Draft' },
  ];

  typeFilters = [
    { label: 'All Types', value: '' },
    { label: 'Individual', value: 'INDIVIDUAL' },
    { label: 'Company', value: 'COMPANY' },
    { label: 'Partnership', value: 'PARTNERSHIP' },
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
      .getIncomeTaxReport(
        this.fiscalYear, this.activeStatus,
        this.activeTaxpayerType, this.page, this.size)
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

  filterByType(type: string): void {
    this.activeTaxpayerType = type;
    this.page = 0;
    this.loadData();
  }

  get filteredRows(): IncomeTaxRow[] {
    if (!this.searchTerm.trim()) return this.rows;
    const q = this.searchTerm.toLowerCase();
    return this.rows.filter(r =>
      r.tinNumber?.toLowerCase().includes(q) ||
      r.taxpayerName?.toLowerCase().includes(q)
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
      reportType: 'INCOME_TAX',
      fiscalYear: this.fiscalYear,
    }).pipe(takeUntil(this.destroy$)).subscribe(blob => {
      this.reportsService.triggerBlobDownload(
        blob, `IncomeTax_${this.fiscalYear}.csv`);
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'accepted':  return 'status-active';
      case 'submitted': return 'status-pending';
      case 'rejected':  return 'status-rejected';
      case 'draft':     return 'status-draft';
      default:          return 'status-pending';
    }
  }

  formatAmount(v: number | null | undefined): string {
    if (!v) return '৳0.00';
    return '৳' + v.toLocaleString('en-BD', { minimumFractionDigits: 2 });
  }
}