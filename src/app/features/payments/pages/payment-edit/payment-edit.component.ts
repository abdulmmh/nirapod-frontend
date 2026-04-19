import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment, PaymentStatusUpdate } from '../../../../models/payment.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-payment-edit',
  templateUrl: './payment-edit.component.html',
  styleUrls: ['./payment-edit.component.css']
})
export class PaymentEditComponent implements OnInit, OnDestroy {

  payment:   Payment | null = null;
  isLoading  = true;
  isSaving   = false;
  paymentId  = 0;

  form: PaymentStatusUpdate = { status: null!, remarks: '' };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.paymentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.http.get<Payment>(API_ENDPOINTS.PAYMENTS.GET(this.paymentId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.payment      = data;
          this.form.status  = data.status;
          this.form.remarks = data.remarks || '';

          if (data.status === 'Completed' || data.status === 'Cancelled') {
            this.toast.warning(`${data.status} payments cannot be edited.`);
            this.router.navigate(['/payments', 'view', this.paymentId]);
          }
        },
        error: () => {
          this.toast.error('Failed to load payment data.');
          this.router.navigate(['/payments']);
        }
      });
  }

  // Returns only valid next statuses based on the current status.
  // Prevents illegal transitions (e.g. Failed → Completed directly).
  get availableStatuses(): string[] {
    switch (this.payment?.status) {
      case 'Pending':
        return ['Completed', 'Failed', 'Cancelled'];
      case 'Failed':
        return ['Pending', 'Cancelled'];
      default:
        return [];
    }
  }

  isFormValid(): boolean {
    return !!(this.form.status);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please select a status.');
      return;
    }

    this.isSaving = true;

    this.http.patch(API_ENDPOINTS.PAYMENTS.UPDATE_STATUS(this.paymentId), this.form)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toast.success('Payment updated successfully!');
          setTimeout(() => this.router.navigate(['/payments', 'view', this.paymentId]), 1500);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to update payment. Please try again.';
          this.toast.error(msg);
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/payments', 'view', this.paymentId]);
  }
}