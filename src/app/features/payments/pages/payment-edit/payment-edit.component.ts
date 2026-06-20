import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, timer } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment, PaymentStatusUpdate } from '../../../../models/payment.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-payment-edit',
  templateUrl: './payment-edit.component.html',
  styleUrls: ['./payment-edit.component.css'],
})
export class PaymentEditComponent implements OnInit, OnDestroy {
  payment: Payment | null = null;
  isLoading = true;
  isSaving = false;
  paymentId = 0;

  form: PaymentStatusUpdate = { status: null!, remarks: '' };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastService,
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
    this.http
      .get<Payment>(API_ENDPOINTS.PAYMENTS.GET(this.paymentId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.payment = data;
          this.form.status = data.status;
          this.form.remarks = data.remarks || '';

          if (data.status === 'Completed' || data.status === 'Cancelled') {
            this.toast.warning(`${data.status} payments cannot be edited.`);
            this.router.navigate(['/payments', 'view', this.paymentId]);
          }
        },
        error: () => {
          this.toast.error('Failed to load payment data.');
          this.router.navigate(['/payments']);
        },
      });
  }

  get availableStatuses(): string[] {
    const role = this.authService?.userRole;
    const status = this.payment?.status;

    if (status === 'Pending') {
      if (role === 'TAX_OFFICER' || role === 'DATA_ENTRY_OPERATOR')
        return ['Under Review', 'Failed'];
      if (
        ['SUPERVISOR', 'TAX_COMMISSIONER', 'SUPER_ADMIN'].includes(role ?? '')
      )
        return ['Under Review', 'Failed'];
      return [];
    }
    if (status === 'Under Review') {
      if (
        ['SUPERVISOR', 'TAX_COMMISSIONER', 'SUPER_ADMIN'].includes(role ?? '')
      )
        return ['Completed', 'Failed'];
      return [];
    }
    if (status === 'Failed') {
      if (['TAX_COMMISSIONER', 'SUPER_ADMIN'].includes(role ?? ''))
        return ['Cancelled'];
      return [];
    }
    return [];
  }

  isFormValid(): boolean {
    return !!this.form.status;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please select a status.');
      return;
    }

    this.isSaving = true;

    this.http
      .patch(API_ENDPOINTS.PAYMENTS.UPDATE_STATUS(this.paymentId), this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('Payment updated successfully!');
          timer(1500)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() =>
              this.router.navigate(['../../view', this.paymentId], {
                relativeTo: this.route,
              }),
            );
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            'Failed to update payment. Please try again.';
          this.toast.error(msg);
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['../../view', this.paymentId], {
      relativeTo: this.route,
    });
  }
}
