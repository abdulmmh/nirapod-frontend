import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
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

  constructor(
    private router: Router,
    private toast: ToastService,
    private penaltyService: PenaltyService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.search$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => this.load(term, this.activeStatus));
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

  filterByStatus(status: string): void {
    this.activeStatus = status;
    this.load(this.searchTerm, status);
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
