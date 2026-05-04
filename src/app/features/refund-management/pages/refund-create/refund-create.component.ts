import { Component, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { RefundCreateRequest } from '../../../../models/refund.model';

@Component({
  selector: 'app-refund-create',
  templateUrl: './refund-create.component.html',
  styleUrls: ['./refund-create.component.css'],
})
export class RefundCreateComponent {
  isLoading = false;

  // Taxpayer search
  searchQuery = '';
  isSearching = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults = false;
  private destroy$ = new Subject<void>();
  successMsg = '';
  errorMsg = '';

  refundTypes = ['VAT Refund', 'Income Tax Refund', 'Excess Payment', 'Other'];
  refundMethods = ['Bank Transfer', 'Cheque', 'Adjustment'];

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

  form: RefundCreateRequest = {
    taxpayerId: null,
    refundType: '',
    refundMethod: '',
    claimAmount: 0,
    returnNo: '',
    paymentRef: '',
    bankName: '',
    bankBranch: '',
    accountNo: '',
    claimDate: new Date().toISOString().split('T')[0],
    remarks: '',
  };

  get showBankFields(): boolean {
    return (
      this.form.refundMethod === 'Bank Transfer' ||
      this.form.refundMethod === 'Cheque'
    );
  }

  isFormValid(): boolean {
    return !!(
      this.selectedTaxpayer !== null &&
      this.form.refundType &&
      this.form.refundMethod &&
      this.form.claimAmount > 0
    );
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.toast.error('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.post(API_ENDPOINTS.PAYMENTS.CREATE, this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMsg = 'Refund claim submitted successfully!';
        this.toast.success('Refund claim submitted successfully!');
        setTimeout(() => this.router.navigate(['/refunds']), 1500);
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'Failed to submit refund claim. Please try again.';
        this.toast.error('Failed to submit refund claim. Please try again.');
      },
    });
  }

  onReset(): void {
    this.form = {
      taxpayerId: null,
      refundType: '',
      refundMethod: '',
      claimAmount: 0,
      returnNo: '',
      paymentRef: '',
      bankName: '',
      bankBranch: '',
      accountNo: '',
      claimDate: new Date().toISOString().split('T')[0],
      remarks: '',
    };
    this.errorMsg = '';
    this.successMsg = '';
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/refunds']);
  }

  formatCurrency(val: number): string {
    if (val >= 100000) return `৳${(val / 100000).toFixed(2)}L`;
    return `৳${val.toLocaleString()}`;
  }

  // ── Taxpayer Search ──────────────────────────────────────────────────────
  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q || q.length < 3) {
      return;
    }
    this.isSearching = true;
    this.http
      .get<Taxpayer[]>(
        API_ENDPOINTS.TAXPAYERS.LIST + '?search=' + encodeURIComponent(q),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSearching = false)),
      )
      .subscribe({
        next: (d) => {
          this.searchResults = d;
          this.showResults = true;
        },
        error: () =>
          this.toast.error('Taxpayer search failed. Please try again.'),
      });
  }

  selectTaxpayer(t: Taxpayer): void {
    this.selectedTaxpayer = t;
    this.form.taxpayerId = t.id ?? null;
    this.showResults = false;
  }

  clearTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.form.taxpayerId = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
  }

  getDisplayName(t: Taxpayer): string {
    return t.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? t.companyName || ''
      : t.fullName || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
