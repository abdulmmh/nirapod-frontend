import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
  filterStatus = '';
  isLoading    = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  private destroy$ = new Subject<void>();

  statuses = [
    '', 'Draft', 'Submitted', 'Under Review',
    'Accepted', 'Rejected', 'Overdue', 'Amended', 'Send Back'
  ];

  constructor(
    private http: HttpClient,
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
        next: (data) => { this.returns = data; },
        error: () => { this.toast.error('Failed to load VAT returns.'); }
      });
  }

  get filtered(): VatReturn[] {
    return this.returns.filter(r => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch = !q ||
        r.returnNo.toLowerCase().includes(q)      ||
        r.businessName.toLowerCase().includes(q)  ||
        r.tinNumber.toLowerCase().includes(q)     ||
        r.binNo.toLowerCase().includes(q)         ||
        r.periodMonth.toLowerCase().includes(q)   ||
        r.periodYear.toLowerCase().includes(q);
      const matchStatus = !this.filterStatus || r.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  countByStatus(status: string): number {
    if (!status) return this.returns.length;
    return this.returns.filter(r => r.status === status).length;
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

  view(id: number): void { this.router.navigate(['/vat-returns/view', id]); }
  edit(id: number): void { this.router.navigate(['/vat-returns/edit', id]); }


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
