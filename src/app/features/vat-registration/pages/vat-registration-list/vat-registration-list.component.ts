import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { VatRegistration } from '../../../../models/vat-registration.model';
import { VatRegistrationService } from '../../services/vat-registration.service';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-vat-registration-list',
  templateUrl: './vat-registration-list.component.html',
  styleUrls: ['./vat-registration-list.component.css'],
})
export class VatRegistrationListComponent implements OnInit, OnDestroy {
  vatRegistrations: VatRegistration[] = [];
  searchTerm = '';

  // ── Filters — "filterStatus" existed before but had no UI; wired up now ────
  filterStatus = '';
  categoryFilter = '';

  readonly statusOptions: string[] = ['Active', 'Inactive', 'Pending', 'Suspended', 'Cancelled'];
  readonly categoryOptions: string[] = ['Standard', 'Zero Rated', 'Exempt', 'Special'];

  // ── Pagination ──────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50, 100];

  isLoading = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;
  pendingDeleteName = '';

  private destroy$ = new Subject<void>();

  constructor(
    private vatService: VatRegistrationService,
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
    this.vatService
      .getAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => (this.vatRegistrations = data),
        error: () => this.toast.error('Failed to load VAT registrations.'),
      });
  }

  // ── KPI Summary Cards ────────────────────────────────────────────────────

  get kpiActive(): number {
    return this.vatRegistrations.filter((v) => v.status === 'Active').length;
  }

  get kpiPending(): number {
    return this.vatRegistrations.filter((v) => v.status === 'Pending').length;
  }

  get kpiSuspended(): number {
    return this.vatRegistrations.filter((v) => v.status === 'Suspended').length;
  }

  get kpiTotalTurnover(): number {
    return this.vatRegistrations
      .filter((v) => v.status === 'Active')
      .reduce((sum, v) => sum + (v.annualTurnover || 0), 0);
  }

  /** Called when a clickable KPI status card is clicked — toggles filter. */
  onKpiCardClick(status: string): void {
    this.filterStatus = this.filterStatus === status ? '' : status;
    this.currentPage = 1;
  }

  isKpiActive(status: string): boolean {
    return this.filterStatus === status;
  }

  /** Any filter/search change resets back to page 1 — call from (ngModelChange). */
  onFilterChange(): void {
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filterStatus || this.categoryFilter);
  }

  clearFilters(): void {
    this.searchTerm     = '';
    this.filterStatus   = '';
    this.categoryFilter = '';
    this.currentPage    = 1;
  }

  get filtered(): VatRegistration[] {
    const q = this.searchTerm.toLowerCase();
    return this.vatRegistrations.filter((v) => {
      const matchSearch =
        !q ||
        (v.binNo?.toLowerCase().includes(q) ?? false) ||
        (v.businessName?.toLowerCase().includes(q) ?? false) ||
        (v.tinNumber?.toLowerCase().includes(q) ?? false) ||
        (v.ownerName?.toLowerCase().includes(q) ?? false) ||
        (v.vatCategory?.toLowerCase().includes(q) ?? false) ||
        (v.district?.toLowerCase().includes(q) ?? false);
      const matchStatus = !this.filterStatus || v.status === this.filterStatus;
      const matchCategory = !this.categoryFilter || v.vatCategory === this.categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  get paginated(): VatRegistration[] {
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
      Active: 'status-active',
      Inactive: 'status-inactive',
      Pending: 'status-pending',
      Suspended: 'status-suspended',
      Cancelled: 'status-inactive',
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      Standard: 'cat-standard',
      'Zero Rated': 'cat-zero',
      Exempt: 'cat-exempt',
      Special: 'cat-special',
    };
    return map[c] ?? '';
  }

  isExpired(date: string): boolean {
    return !!date && new Date(date) < new Date();
  }

  formatCurrency(a: number): string {
    if (a >= 100_000) return `৳${(a / 100_000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }
  // ───────────────── Navigation ───────────────────────

  view(id: number): void {
    this.router.navigate(['view', id], {
      relativeTo: this.route,
    });
  }

  edit(id: number): void {
    this.router.navigate(['edit', id], {
      relativeTo: this.route,
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route,
    });
  }

  confirmDelete(id: number, businessName: string): void {
    this.pendingDeleteId = id;
    this.pendingDeleteName = businessName;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }
  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    const name = this.pendingDeleteName;
    this.resetDeleteState();
    this.delete(id, name);
  }

  private delete(id: number, businessName: string): void {
    this.vatService
      .remove(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.vatRegistrations = this.vatRegistrations.filter(
            (v) => v.id !== id,
          );
          this.toast.success(
            `VAT registration for "${businessName}" deleted successfully.`,
          );
        },
        error: () =>
          this.toast.error(
            'Failed to delete VAT registration. Please try again.',
          ),
      });
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.pendingDeleteName = '';
    this.showDeleteModal = false;
  }
}