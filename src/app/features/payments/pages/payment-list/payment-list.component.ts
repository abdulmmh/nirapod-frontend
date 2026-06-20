import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment } from '../../../../models/payment.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css'],
})
export class PaymentListComponent implements OnInit, OnDestroy {
  payments: Payment[] = [];
  searchTerm = '';
  isLoading = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  private destroy$ = new Subject<void>();

  // ── Filters — matches Audit module's "All Statuses / All Types / All Years" pattern ──
  statusFilter = '';
  typeFilter   = '';
  yearFilter   = '';

  statusOptions: string[] = ['Pending', 'Under Review', 'Completed', 'Failed', 'Cancelled'];
  typeOptions:   string[] = ['VAT', 'Income Tax', 'Penalty', 'Other'];
  yearOptions:   string[] = [];   // populated from payment dates once data loads

  // ── Pagination ──
  currentPage = 1;
  pageSize = 20;
  pageSizeOptions = [10, 20, 50, 100];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
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
      .get<Payment[]>(API_ENDPOINTS.PAYMENTS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.payments = data;
          this.buildYearOptions();
        },
        error: () => {
          this.toast.error('Failed to load payments. Please refresh the page.');
        },
      });
  }

  /** Extracts distinct years from paymentDate (e.g. "2026-05-05" → "2026"), newest first. */
  private buildYearOptions(): void {
    const years = new Set<string>();
    for (const p of this.payments) {
      if (p.paymentDate) years.add(p.paymentDate.substring(0, 4));
    }
    this.yearOptions = Array.from(years).sort((a, b) => b.localeCompare(a));
  }

  // ── KPI Summary Cards — mirrors Audit module's 5-card header row ───────────

  get kpiPending(): number {
    return this.payments.filter((p) => p.status === 'Pending').length;
  }

  get kpiUnderReview(): number {
    return this.payments.filter((p) => p.status === 'Under Review').length;
  }

  get kpiCompleted(): number {
    return this.payments.filter((p) => p.status === 'Completed').length;
  }

  get kpiFailed(): number {
    return this.payments.filter((p) => p.status === 'Failed').length;
  }

  get kpiTotalCollected(): number {
    return this.payments
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  // ── Filtering (search term + dropdown filters together) ────────────────────

  get filteredPayments(): Payment[] {
    let result = this.payments;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.transactionId.toLowerCase().includes(term) ||
          p.taxpayerName.toLowerCase().includes(term) ||
          p.tinNumber.toLowerCase().includes(term) ||
          p.paymentType.toLowerCase().includes(term) ||
          (p.referenceNo || '').toLowerCase().includes(term),
      );
    }

    if (this.statusFilter) {
      result = result.filter((p) => p.status === this.statusFilter);
    }
    if (this.typeFilter) {
      result = result.filter((p) => p.paymentType === this.typeFilter);
    }
    if (this.yearFilter) {
      result = result.filter((p) => p.paymentDate?.startsWith(this.yearFilter));
    }

    return result;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter || this.typeFilter || this.yearFilter);
  }

  clearFilters(): void {
    this.searchTerm   = '';
    this.statusFilter = '';
    this.typeFilter   = '';
    this.yearFilter   = '';
    this.currentPage  = 1;
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

  /** Any filter/search change should reset back to page 1 — call from (ngModelChange). */
  onFilterChange(): void {
    this.currentPage = 1;
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPayments.length / this.pageSize));
  }

  get paginatedPayments(): Payment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPayments.slice(start, start + this.pageSize);
  }

  get pageRangeStart(): number {
    if (this.filteredPayments.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPayments.length);
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

  // ── Delete flow ──

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.pendingDeleteId = null;
    this.showDeleteModal = false;

    this.http
      .delete(API_ENDPOINTS.PAYMENTS.DELETE(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.payments = this.payments.filter((p) => p.id !== id);
          this.toast.success('Payment deleted successfully.');
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            'Failed to delete payment. Please try again.';
          this.toast.error(msg);
        },
      });
  }

  // ── Navigation ──

  viewPayment(id: number): void {
    this.router.navigate(['view', id], {
      relativeTo: this.route
    });
  }
  editPayment(id: number): void {
    this.router.navigate(['edit', id], {
      relativeTo: this.route
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route
    });
  }

  // ── UI Helpers ──

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Completed: 'status-active',
      Pending: 'status-pending',
      'Under Review': 'status-review',
      Failed: 'status-suspended',
      Cancelled: 'status-inactive',
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      VAT: 'type-vat',
      'Income Tax': 'type-it',
      Penalty: 'type-penalty',
      Other: 'type-other',
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }
}