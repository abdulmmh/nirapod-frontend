import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

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
    { label: 'All',       value: '' },
    { label: 'Pending',   value: 'PENDING' },
    { label: 'Cleared',   value: 'CLEARED' },
    { label: 'Rejected',  value: 'REJECTED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
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

    let params = new HttpParams()
      .set('page', this.page)
      .set('size', this.size);

    if (this.activeStatus) {
      params = params.set('status', this.activeStatus);
    }

    this.http
      .get<any>(API_ENDPOINTS.IMPORT_DUTIES.LIST, { params })
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (Array.isArray(res)) {
            this.rows          = res;
            this.totalElements = res.length;
            this.totalPages    = 1;
          } else {
            this.rows          = res.content || res.data || [];
            this.totalElements = res.totalElements || this.rows.length;
            this.totalPages    = res.totalPages || 1;
          }
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
      r.referenceNo?.toLowerCase().includes(q) ||
      r.importerName?.toLowerCase().includes(q) ||
      r.portOfEntry?.toLowerCase().includes(q) ||
      r.commodityDescription?.toLowerCase().includes(q)
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

  formatAmount(v: number | null | undefined): string {
    if (!v) return '৳0.00';
    return '৳' + v.toLocaleString('en-BD', { minimumFractionDigits: 2 });
  }
}