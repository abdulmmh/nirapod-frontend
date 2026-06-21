import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { Penalty } from '../../../../models/penalty.model';
import { PenaltyService } from '../../services/penalty.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-penalty-list',
  templateUrl: './penalty-list.component.html',
  styleUrls: ['./penalty-list.component.css'],
})
export class PenaltyListComponent implements OnInit {
  penalties: Penalty[] = [];
  searchTerm = '';
  activeStatus = '';
  isLoading = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  private search$ = new Subject<string>();

  readonly statusFilters = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Issued', value: 'ISSUED' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Appealed', value: 'APPEALED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  // ── Pagination — client-side, since backend returns the full filtered set ──
  currentPage = 1;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50, 100];

  constructor(
    private router: Router,
    private toast: ToastService,
    private penaltyService: PenaltyService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.search$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.currentPage = 1;
        this.load(term, this.activeStatus);
      });
  }

  load(search = '', status = ''): void {
    this.isLoading = true;
    this.penaltyService
      .getAll(search || undefined, status || undefined)
      .subscribe({
        next: (data) => {
          this.penalties = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to load penalties.');
        },
      });
  }

  onSearchInput(): void {
    this.search$.next(this.searchTerm);
  }

  // ── KPI Summary Cards — replaces the old filter-pill row ───────────────────
  //
  // Counts are computed from the currently-loaded `penalties` array (already
  // filtered server-side by activeStatus/search). Clicking a card re-triggers
  // load() with that status, same as the old pills did.

  get kpiPendingApproval(): number {
    return this.penalties.filter((p) => p.status === 'PENDING_APPROVAL').length;
  }

  get kpiIssued(): number {
    return this.penalties.filter((p) => p.status === 'ISSUED').length;
  }

  get kpiPaid(): number {
    return this.penalties.filter((p) => p.status === 'PAID').length;
  }

  get kpiAppealed(): number {
    return this.penalties.filter((p) => p.status === 'APPEALED').length;
  }

  get kpiTotalCollected(): number {
    return this.penalties
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }

  filterByStatus(status: string): void {
    this.activeStatus = this.activeStatus === status ? '' : status;
    this.currentPage = 1;
    this.load(this.searchTerm, this.activeStatus);
  }

  isKpiActive(status: string): boolean {
    return this.activeStatus === status;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.activeStatus);
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.activeStatus = '';
    this.currentPage = 1;
    this.load();
  }

  get filteredPenalties(): Penalty[] {
    if (!this.searchTerm.trim()) return this.penalties;
    const term = this.searchTerm.toLowerCase();
    return this.penalties.filter(
      (p) =>
        p.penaltyNo.toLowerCase().includes(term) ||
        p.taxpayerName.toLowerCase().includes(term) ||
        p.tinNumber.toLowerCase().includes(term) ||
        p.penaltyType.toLowerCase().includes(term) ||
        p.assessmentYear.toLowerCase().includes(term),
    );
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPenalties.length / this.pageSize));
  }

  get paginatedPenalties(): Penalty[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPenalties.slice(start, start + this.pageSize);
  }

  get pageRangeStart(): number {
    if (this.filteredPenalties.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPenalties.length);
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

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'status-draft',
      PENDING_APPROVAL: 'status-pending',
      APPROVED: 'status-approved',
      ISSUED: 'status-issued',
      PARTIALLY_PAID: 'status-partial',
      PAID: 'status-active',
      APPEALED: 'status-appealed',
      CANCELLED: 'status-cancelled',
      CLOSED: 'status-closed',
      Issued: 'status-issued',
      Pending: 'status-pending',
      Paid: 'status-active',
      Overdue: 'status-overdue',
    };
    return map[status] ?? '';
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      Low: 'sev-low',
      Medium: 'sev-medium',
      High: 'sev-high',
      Critical: 'sev-critical',
    };
    return map[severity] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'Late Filing': 'type-late',
      'Late Payment': 'type-late',
      'Non-Compliance': 'type-noncompliance',
      Fraud: 'type-fraud',
      Underpayment: 'type-under',
      Other: 'type-other',
    };
    return map[type] ?? '';
  }

  isDueOverdue(p: Penalty): boolean {
    if (!p.dueDate) return false;
    if (['PAID', 'CANCELLED', 'CLOSED'].includes(p.status)) return false;
    return new Date(p.dueDate) < new Date();
  }

  formatCurrency(amount: number): string {
    if (!amount) return '৳0';
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }

  viewPenalty(id: number): void {
    this.router.navigate(['/penalties', 'view', id]);
  }
  editPenalty(id: number): void {
    this.router.navigate(['/penalties', 'edit', id]);
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }
  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  confirmDeleteExecute(): void {
    if (!this.pendingDeleteId) return;
    const id = this.pendingDeleteId;
    this.cancelDelete();
    this.penaltyService.delete(id).subscribe({
      next: () => {
        this.penalties = this.penalties.filter((p) => p.id !== id);
        this.toast.success('Penalty deleted.');
      },
      error: () => this.toast.error('Delete failed.'),
    });
  }
}