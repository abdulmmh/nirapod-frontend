import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, timer } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Refund } from '../../../../models/refund.model';

@Component({
  selector: 'app-refund-edit',
  templateUrl: './refund-edit.component.html',
  styleUrls: ['./refund-edit.component.css'],
})
export class RefundEditComponent implements OnInit, OnDestroy {
  isLoading = true;
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  refundId = 0;

  refundTypes = ['VAT Refund', 'Income Tax Refund', 'Excess Payment', 'Other'];
  refundMethods = ['Bank Transfer', 'Cheque', 'Adjustment'];
  statuses = [
    'Pending',
    'Approved',
    'Rejected',
    'Processing',
    'Completed',
    'Cancelled',
  ];

  banks = [
    'Sonali Bank',
    'Agrani Bank',
    'Janata Bank',
    'Rupali Bank',
    'Dutch-Bangla Bank',
    'BRAC Bank',
    'Islami Bank',
    'Prime Bank',
    'Eastern Bank',
    'Mercantile Bank',
    'Other',
  ];

  form: any = {};
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.refundId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRefund();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRefund(): void {
    this.isLoading = true;
    this.http.get<Refund>(API_ENDPOINTS.PAYMENTS.GET(this.refundId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (data) => {
        this.form = { ...data };
        this.isLoading = false;
      },
      error: () => {
        this.form = {
          id: this.refundId,
          refundNo: 'RFD-2024-00001',
          tinNumber: 'TIN-1001',
          taxpayerName: 'Rahman Textile Ltd.',
          refundType: 'VAT Refund',
          refundMethod: 'Bank Transfer',
          claimAmount: 90000,
          approvedAmount: 85000,
          paidAmount: 85000,
          returnNo: 'VAT-2024-00001',
          paymentRef: 'TXN-2024-44821',
          bankName: 'Sonali Bank',
          bankBranch: 'Motijheel Branch',
          accountNo: '1234567890',
          claimDate: '2024-03-20',
          approvalDate: '2024-04-05',
          paymentDate: '2024-04-10',
          status: 'Completed',
          processedBy: 'Tax Officer',
          approvedBy: 'Tax Commissioner',
          remarks: '',
        };
        this.isLoading = false;
        this.toast.error('Failed to load refund details. Showing sample data.');
      },
    });
  }

  get showBankFields(): boolean {
    return (
      this.form.refundMethod === 'Bank Transfer' ||
      this.form.refundMethod === 'Cheque'
    );
  }

  isFormValid(): boolean {
    return !!(
      this.form.refundType &&
      this.form.refundMethod &&
      this.form.claimAmount > 0
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.toast.error('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http
      .put(API_ENDPOINTS.PAYMENTS.GET(this.refundId), this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMsg = 'Refund updated successfully!';
          this.toast.success('Refund updated successfully!');
          timer(1500).pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['/refunds']));
        },
        error: () => {
          this.isSaving = false;
          this.errorMsg = 'Failed to update refund. Please try again.';
          this.toast.error('Failed to update refund. Please try again.');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/refunds', this.refundId]);
  }
}
