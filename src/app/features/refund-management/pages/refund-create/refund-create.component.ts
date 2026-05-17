import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil, timer } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { RefundCreateRequest } from '../../../../models/refund.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-refund-create',
  templateUrl: './refund-create.component.html',
  styleUrls: ['./refund-create.component.css']
})
export class RefundCreateComponent implements OnInit, OnDestroy {

  isLoading   = false;
  isSearching = false;
  private destroy$ = new Subject<void>();

  // ── Taxpayer search ────────────────────────────────────────────────────────
  searchQuery      = '';
  searchResults: Taxpayer[]     = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults      = false;
  hasSearched      = false;

  // ── Dropdown options ───────────────────────────────────────────────────────
  refundTypes   = ['Income Tax Refund', 'VAT Refund', 'Excess Payment', 'Other'];
  refundMethods = ['Bank Transfer', 'Cheque', 'Adjustment'];
  banks = [
    'Sonali Bank', 'Agrani Bank', 'Janata Bank', 'Rupali Bank',
    'Dutch-Bangla Bank', 'BRAC Bank', 'Islami Bank', 'Prime Bank',
    'Eastern Bank', 'Mercantile Bank', 'Other'
  ];

  form: RefundCreateRequest = this.emptyForm();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  get showBankFields(): boolean {
    return this.form.refundMethod === 'Bank Transfer' ||
           this.form.refundMethod === 'Cheque';
  }

  isFormValid(): boolean {
    const bankOk = !this.showBankFields ||
      (!!this.form.bankName && !!this.form.accountNo);

    return !!(
      this.selectedTaxpayer &&
      this.form.refundType   &&
      this.form.refundMethod &&
      this.form.claimAmount > 0 &&
      bankOk
    );
  }

  // ── Taxpayer search ───────────────────────────────────────────────────────

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults   = false;
      this.hasSearched   = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q || q.length < 3) {
      this.toast.warning('Enter at least 3 characters to search.');
      return;
    }
    this.isSearching = true;
    this.showResults = false;
    this.http.get<Taxpayer[]>(
      `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`
    ).pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        next: (data) => {
          this.searchResults = data;
          this.showResults   = true;
          this.hasSearched   = true;
          if (!data.length) this.toast.info('No taxpayer found.');
        },
        error: () => this.toast.error('Search failed. Please try again.')
      });
  }

  selectTaxpayer(t: Taxpayer): void {
    this.selectedTaxpayer  = t;
    this.form.taxpayerId   = t.id ?? null;
    this.showResults       = false;
  }

  clearTaxpayer(): void {
    this.selectedTaxpayer  = null;
    this.form.taxpayerId   = null;
    this.searchQuery       = '';
    this.searchResults     = [];
    this.showResults       = false;
    this.hasSearched       = false;
  }

  getDisplayName(t: Taxpayer): string {
    return t.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? (t.companyName || '') : (t.fullName || '');
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;

    // ✅ Fixed: was incorrectly posting to API_ENDPOINTS.PAYMENTS.CREATE
    this.http.post(API_ENDPOINTS.REFUNDS.CREATE, this.form)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          // ✅ Fixed: success toast only fires on actual success, never on error
          this.toast.success('Refund claim submitted successfully!');
          timer(1500).pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['/refunds']));
        },
        error: (err) => {
          // ✅ Fixed: was showing a success toast in the error handler
          const msg = err?.error?.message || 'Failed to submit refund claim. Please try again.';
          this.toast.error(msg);
        }
      });
  }

  onReset(): void {
    this.form = this.emptyForm();
    this.clearTaxpayer();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void { this.router.navigate(['/refunds']); }

  formatCurrency(val: number): string {
    if (val >= 100000) return `৳${(val / 100000).toFixed(2)}L`;
    return `৳${val.toLocaleString()}`;
  }

  private emptyForm(): RefundCreateRequest {
    return {
      taxpayerId:   null,
      refundType:   '',
      refundMethod: '',
      claimAmount:  0,
      returnNo:     '',
      paymentRef:   '',
      bankName:     '',
      bankBranch:   '',
      accountNo:    '',
      claimDate:    new Date().toISOString().split('T')[0],
      remarks:      ''
    };
  }
}
