import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatReturn } from '../../../../models/vat-return.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-vat-return-list',
  templateUrl: './vat-return-list.component.html',
  styleUrls: ['./vat-return-list.component.css']
})
export class VatReturnListComponent implements OnInit, OnDestroy {

  returns: VatReturn[] = [];
  searchTerm   = '';
  isLoading    = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  private destroy$ = new Subject<void>();

  // ── Filters — replaces the old status-tabs with KPI cards + dropdown ──────
  statusFilter = '';
  yearFilter   = '';

  readonly statusOptions: string[] = [
    'Draft', 'Submitted', 'Under Review',
    'Accepted', 'Rejected', 'Overdue', 'Amended', 'Send Back'
  ];
  yearOptions: string[] = [];   // populated from periodYear once data loads

  // ── Pagination ──────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50, 100];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void { this.loadData(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.http.get<VatReturn[]>(API_ENDPOINTS.VAT_RETURNS.LIST)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.returns = data;
          this.buildYearOptions();
        },
        error: () => { this.toast.error('Failed to load VAT returns.'); }
      });
  }

  /** Extracts distinct period years for the Year filter dropdown. */
  private buildYearOptions(): void {
    const years = new Set<string>();
    for (const r of this.returns) {
      if (r.periodYear) years.add(r.periodYear);
    }
    this.yearOptions = Array.from(years).sort((a, b) => b.localeCompare(a));
  }

  // ── KPI Summary Cards — mirrors Payment/ITR module's card row ──────────────

  get kpiSubmitted(): number {
    return this.returns.filter((r) => r.status === 'Submitted').length;
  }

  get kpiUnderReview(): number {
    return this.returns.filter((r) => r.status === 'Under Review').length;
  }

  get kpiAccepted(): number {
    return this.returns.filter((r) => r.status === 'Accepted').length;
  }

  get kpiRejected(): number {
    return this.returns.filter((r) => r.status === 'Rejected').length;
  }

  get kpiTotalCollected(): number {
    return this.returns
      .filter((r) => r.status === 'Accepted')
      .reduce((sum, r) => sum + (r.netTaxPayable || 0), 0);
  }

  /** Called when a clickable KPI status card is clicked — toggles filter. */
  onKpiCardClick(status: string): void {
    this.statusFilter = this.statusFilter === status ? '' : status;
    this.currentPage = 1;
  }

  isKpiActive(status: string): boolean {
    return this.statusFilter === status;
  }

  /** Any filter/search change resets back to page 1 — call from (ngModelChange). */
  onFilterChange(): void {
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter || this.yearFilter);
  }

  clearFilters(): void {
    this.searchTerm   = '';
    this.statusFilter = '';
    this.yearFilter   = '';
    this.currentPage  = 1;
  }

  get filtered(): VatReturn[] {
    return this.returns.filter(r => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch = !q ||
        (r.returnNo     ?? '').toLowerCase().includes(q) ||
        (r.businessName ?? '').toLowerCase().includes(q) ||
        (r.tinNumber    ?? '').toLowerCase().includes(q) ||
        (r.binNo        ?? '').toLowerCase().includes(q) ||
        (r.periodMonth  ?? '').toLowerCase().includes(q) ||
        (r.periodYear   ?? '').toLowerCase().includes(q);
      const matchStatus = !this.statusFilter || r.status === this.statusFilter;
      const matchYear   = !this.yearFilter   || r.periodYear === this.yearFilter;
      return matchSearch && matchStatus && matchYear;
    });
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paginated(): VatReturn[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get pageRangeStart(): number {
    if (this.filtered.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filtered.length);
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft':        'status-draft',
      'Submitted':    'status-pending',
      'Under Review': 'status-review',
      'Accepted':     'status-active',
      'Rejected':     'status-suspended',
      'Overdue':      'status-overdue',
      'Amended':      'status-amended',
      'Send Back':    'status-sendback'
    };
    return map[s] ?? '';
  }

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }


  // ───────────────── Navigation ───────────────────────

  view(id: number): void {
    this.router.navigate(['view', id], {
      relativeTo: this.route
    });
  }

  edit(id: number): void {
    this.router.navigate(['edit', id], {
      relativeTo: this.route
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route
    });
  }

   // ──────────────── Delete Flow  ─────────────────

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.resetDeleteState();
    this.deleteReturn(id);
  }

  private deleteReturn(id: number): void {
    this.isLoading = true;
    this.http
      .delete(API_ENDPOINTS.VAT_RETURNS.DELETE(id))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.handleDeleteSuccess(id),
        error: () => this.handleDeleteError(),
      });
  }

  private handleDeleteSuccess(id: number): void {
    this.returns = this.returns.filter((v) => v.id !== id);
    this.toast.success('Returns deleted successfully.');
    this.resetDeleteState();
  }

  private handleDeleteError(): void {
    this.toast.error('Failed to delete VAT Returns. Please try again.');
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }
}