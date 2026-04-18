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
  filterStatus = '';
  isLoading = false;
  isExporting = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  private destroy$ = new Subject<void>();

  statuses = [
    '',
    'Draft',
    'Submitted',
    'Under Review',
    'Accepted',
    'Rejected',
    'Overdue',
    'Amended',
    'Send Back',
  ];

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
        },
        error: () => {
          this.toast.error('Failed to load income tax returns.');
        },
      });
  }

  get filtered(): IncomeTaxReturn[] {
    return this.returns.filter((r) => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        (r.returnNo || '').toLowerCase().includes(q) ||
        r.taxpayerName.toLowerCase().includes(q) ||
        r.tinNumber.toLowerCase().includes(q) ||
        r.itrCategory.toLowerCase().includes(q) ||
        r.assessmentYear.toLowerCase().includes(q);

      const matchStatus = !this.filterStatus || r.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  countByStatus(status: string): number {
    if (!status) return this.returns.length;
    return this.returns.filter((r) => r.status === status).length;
  }

  getStatusClass(s: string): string {
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
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      Individual: 'cat-individual',
      Company: 'cat-company',
      Partnership: 'cat-partner',
      NGO: 'cat-ngo',
    };
    return map[c] ?? '';
  }

  onExport(): void {
    this.isExporting = true;

    this.http
      .get(API_ENDPOINTS.INCOME_TAX_RETURNS.EXPORT, { responseType: 'blob' })
      .pipe(finalize(() => (this.isExporting = false)))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ITR_Export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          this.toast.success('Data exported successfully!');
        },
        error: () => {
          this.toast.error('Failed to export data.');
        },
      });
  }

  formatCurrency(a: number | null | undefined): string {
    if (a == null || isNaN(a)) {
      return '৳0';
    }
    if (a >= 10000000) return `৳${(a / 10000000).toFixed(2)} Cr`;
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)} L`;
    return `৳${a.toLocaleString('en-BD')}`;
  }

  view(id: number): void {
    this.router.navigate(['/income-tax-returns/view', id]);
  }
  edit(id: number): void {
    this.router.navigate(['/income-tax-returns/edit', id]);
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
    this.deleteReturns(id);
  }

  private deleteReturns(id: number): void {
    const backup = [...this.returns];

    this.returns = this.returns.filter((b) => b.id !== id);

    this.http
      .delete(API_ENDPOINTS.INCOME_TAX_RETURNS.DELETE(id), {
        responseType: 'text',
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.handleDeleteSuccess(id),
        error: () => this.handleDeleteError(),
      });
  }

  private handleDeleteSuccess(id: number): void {
    this.returns = this.returns.filter((b) => b.id !== id);
    this.toast.success(`Return deleted successfully.`);
    this.resetDeleteState();
  }

  private handleDeleteError(): void {
    this.toast.error('Failed to delete income tax return. Please try again.');
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }
}
