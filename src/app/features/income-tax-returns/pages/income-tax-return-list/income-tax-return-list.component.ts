import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturn } from '../../../../models/income-tax-return.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-income-tax-return-list',
  templateUrl: './income-tax-return-list.component.html',
  styleUrls: ['./income-tax-return-list.component.css'],
})
export class IncomeTaxReturnListComponent implements OnInit, OnDestroy {
  returns: IncomeTaxReturn[] = [];
  searchTerm = '';
  isLoading = false;
  isExporting = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  // ── Filters — matches Audit/Payment module's dropdown pattern ─────────────
  statusFilter   = '';
  categoryFilter = '';
  yearFilter     = '';

  readonly statusOptions: string[] = [
    'Draft',
    'Submitted',
    'Under Review',
    'Accepted',
    'Rejected',
    'Overdue',
    'Amended',
    'Send Back',
  ];
  readonly categoryOptions: string[] = ['Individual', 'Company', 'Partnership', 'NGO'];
  yearOptions: string[] = [];   // populated from assessmentYear once data loads

  // ── Pagination ──────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50, 100];

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.http
      .get<IncomeTaxReturn[]>(API_ENDPOINTS.INCOME_TAX_RETURNS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.returns = data;
          this.buildYearOptions();
        },
        error: () => this.toast.error('Failed to load income tax returns.'),
      });
  }

  /** Extracts distinct assessment years (e.g. "2025-26"), newest first. */
  private buildYearOptions(): void {
    const years = new Set<string>();
    for (const r of this.returns) {
      if (r.assessmentYear) years.add(r.assessmentYear);
    }
    this.yearOptions = Array.from(years).sort((a, b) => b.localeCompare(a));
  }

  // ── KPI Summary Cards — mirrors Audit/Payment module's card row ───────────

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
      .reduce((sum, r) => sum + (r.taxPaid || 0), 0);
  }

  // ── Filtering (search term + dropdown filters together) ────────────────────

  get filtered(): IncomeTaxReturn[] {
    let result = this.returns;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.returnNo || '').toLowerCase().includes(term) ||
          (r.taxpayerName || '').toLowerCase().includes(term) ||
          (r.tinNumber || '').toLowerCase().includes(term) ||
          (r.itrCategory || '').toLowerCase().includes(term) ||
          (r.assessmentYear || '').toLowerCase().includes(term),
      );
    }

    if (this.statusFilter) {
      result = result.filter((r) => r.status === this.statusFilter);
    }
    if (this.categoryFilter) {
      result = result.filter((r) => r.itrCategory === this.categoryFilter);
    }
    if (this.yearFilter) {
      result = result.filter((r) => r.assessmentYear === this.yearFilter);
    }

    return result;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter || this.categoryFilter || this.yearFilter);
  }

  clearFilters(): void {
    this.searchTerm     = '';
    this.statusFilter   = '';
    this.categoryFilter = '';
    this.yearFilter     = '';
    this.currentPage     = 1;
  }

  /** Called when a clickable KPI status card is clicked — toggles filter. */
  onKpiCardClick(status: string): void {
    this.statusFilter = this.statusFilter === status ? '' : status;
    this.currentPage  = 1;
  }

  /** Returns true when a given status card is the active filter. */
  isKpiActive(status: string): boolean {
    return this.statusFilter === status;
  }

  /** Any filter/search change resets back to page 1 — call from (ngModelChange). */
  onFilterChange(): void {
    this.currentPage = 1;
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paginated(): IncomeTaxReturn[] {
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

  // ── UI Helpers ──────────────────────────────────────────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'status-draft',
      Submitted: 'status-pending',
      'Under Review': 'status-review',
      Accepted: 'status-active',
      Rejected: 'status-suspended',
      Overdue: 'status-overdue',
      Amended: 'status-amended',
      'Send Back': 'status-sendback',
    };
    return map[status] ?? '';
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      Individual: 'cat-individual',
      Company: 'cat-company',
      Partnership: 'cat-partner',
      NGO: 'cat-ngo',
    };
    return map[category] ?? '';
  }

  taxableIncomeOf(item: IncomeTaxReturn): number {
    return item.taxableIncome ?? Math.max(0, (item.grossIncome || 0) - (item.exemptIncome || 0));
  }

  netPayableOf(item: IncomeTaxReturn): number {
    return item.netTaxPayable ?? Math.max(0, (item.grossTax || 0) - (item.taxRebate || 0));
  }

  refundableOf(item: IncomeTaxReturn): number {
    const paid = (item.advanceTaxPaid || 0) + (item.withholdingTax || 0) + (item.taxPaid || 0);
    return item.refundable ?? Math.max(0, paid - this.netPayableOf(item));
  }

  onExport(): void {
    this.isExporting = true;
    this.http
      .get(API_ENDPOINTS.INCOME_TAX_RETURNS.EXPORT, { responseType: 'blob' })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isExporting = false)),
      )
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ITR_Export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.toast.success('Data exported successfully!');
        },
        error: () => this.toast.error('Failed to export data.'),
      });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount == null || isNaN(amount)) return 'BDT 0';
    if (amount >= 10000000) return `BDT ${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `BDT ${(amount / 100000).toFixed(2)} L`;
    return `BDT ${amount.toLocaleString('en-BD')}`;
  }

  view(id: number): void {
    this.router.navigate(['/income-tax-returns/view', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/income-tax-returns/edit', id]);
  }

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
    const backup = [...this.returns];
    this.returns = this.returns.filter((item) => item.id !== id);

    this.http
      .delete(API_ENDPOINTS.INCOME_TAX_RETURNS.DELETE(id), { responseType: 'text' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.toast.success('Return deleted successfully.'),
        error: () => {
          this.returns = backup;
          this.toast.error('Failed to delete income tax return. Please try again.');
        },
      });
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }
}