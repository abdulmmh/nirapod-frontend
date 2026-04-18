import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment } from '../../../../models/payment.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-payment-view',
  templateUrl: './payment-view.component.html',
  styleUrls: ['./payment-view.component.css']
})
export class PaymentViewComponent implements OnInit, OnDestroy {

  payment: Payment | null = null;
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(id: number): void {
    this.isLoading = true;
    this.http.get<Payment>(API_ENDPOINTS.PAYMENTS.GET(id))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => { this.payment = data; },
        error: () => {
          this.toast.error('Failed to load payment details.');
          this.router.navigate(['/payments']);
        }
      });
  }

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
    return `৳${(amount || 0).toLocaleString()}`;
  }

  // Completed payments have no edit
  canEdit(): boolean {
    return this.payment?.status !== 'Completed';
  }

  onEdit(): void {
    this.router.navigate(['/payments', 'edit', this.payment?.id]);
  }

  onBack(): void {
    this.router.navigate(['/payments']);
  }
}