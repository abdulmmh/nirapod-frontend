import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment } from '../../../../models/payment.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit, OnDestroy {

  payments:   Payment[] = [];
  searchTerm  = '';
  isLoading   = false;

  showDeleteModal  = false;
  pendingDeleteId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
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
    this.http.get<Payment[]>(API_ENDPOINTS.PAYMENTS.LIST)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => { this.payments = data; },
        error: () => { this.toast.error('Failed to load payments. Please refresh the page.'); }
      });
  }

  // ── Filtering ──

  get filteredPayments(): Payment[] {
    if (!this.searchTerm.trim()) return this.payments;
    const term = this.searchTerm.toLowerCase();
    return this.payments.filter(p =>
      p.transactionId.toLowerCase().includes(term) ||
      p.taxpayerName.toLowerCase().includes(term)  ||
      p.tinNumber.toLowerCase().includes(term)     ||
      p.paymentType.toLowerCase().includes(term)   ||
      (p.referenceNo || '').toLowerCase().includes(term)
    );
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

    this.http.delete(API_ENDPOINTS.PAYMENTS.DELETE(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.payments = this.payments.filter(p => p.id !== id);
          this.toast.success('Payment deleted successfully.');
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to delete payment. Please try again.';
          this.toast.error(msg);
        }
      });
  }

  // ── Navigation ──

  viewPayment(id: number): void  { this.router.navigate(['/payments', 'view', id]); }
  editPayment(id: number): void  { this.router.navigate(['/payments', 'edit', id]); }

  // ── UI Helpers ──

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Completed': 'status-active',
      'Pending':   'status-pending',
      'Failed':    'status-suspended',
      'Cancelled': 'status-inactive'
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VAT':        'type-vat',
      'Income Tax': 'type-it',
      'Penalty':    'type-penalty',
      'Other':      'type-other'
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }
}