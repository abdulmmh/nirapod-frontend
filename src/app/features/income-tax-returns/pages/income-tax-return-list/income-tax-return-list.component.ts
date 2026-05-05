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

  readonly statuses = [
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
        next: (data) => (this.returns = data),
        error: () => this.toast.error('Failed to load income tax returns.'),
      });
  }

  get filtered(): IncomeTaxReturn[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.returns.filter((r) => {
      const matchesSearch =
        !term ||
        (r.returnNo || '').toLowerCase().includes(term) ||
        (r.taxpayerName || '').toLowerCase().includes(term) ||
        (r.tinNumber || '').toLowerCase().includes(term) ||
        (r.itrCategory || '').toLowerCase().includes(term) ||
        (r.assessmentYear || '').toLowerCase().includes(term);

      const matchesStatus = !this.filterStatus || r.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  countByStatus(status: string): number {
    return status ? this.returns.filter((r) => r.status === status).length : this.returns.length;
  }

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
