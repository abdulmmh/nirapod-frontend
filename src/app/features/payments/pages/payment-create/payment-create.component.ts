import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { PaymentCreateRequest } from '../../../../models/payment.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-payment-create',
  templateUrl: './payment-create.component.html',
  styleUrls: ['./payment-create.component.css']
})
export class PaymentCreateComponent implements OnDestroy {

  isLoading  = false;
  private destroy$ = new Subject<void>();

  // ── Taxpayer Search ──
  searchQuery      = '';
  isSearching      = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults      = false;
  hasSearched      = false;

  // ── Dropdown Options ──
  paymentTypes   = ['VAT', 'Income Tax', 'Penalty', 'Other'];
  paymentMethods = ['Bank Transfer', 'Online Banking', 'Cheque', 'Cash', 'Mobile Banking'];
  banks = [
    'Sonali Bank', 'Agrani Bank', 'Janata Bank', 'Rupali Bank',
    'Dutch-Bangla Bank', 'BRAC Bank', 'Islami Bank', 'Prime Bank',
    'Eastern Bank', 'Mercantile Bank', 'bKash', 'Nagad', 'Rocket', 'Other'
  ];

  form: PaymentCreateRequest = this.getEmptyForm();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Getters ──

  get isAutoFilled(): boolean {
    return this.selectedTaxpayer !== null;
  }

  get showChequeField(): boolean {
    return this.form.paymentMethod === 'Cheque';
  }

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    const type = tp.taxpayerType?.typeName?.toLowerCase() || '';
    return type.includes('company')
      ? (tp.companyName || 'Unknown Company')
      : (tp.fullName || 'Unknown Individual');
  }

  // ── Taxpayer Search ──

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults   = false;
      this.hasSearched   = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.toast.warning('Enter TIN number, NID or taxpayer name to search.');
      return;
    }
    if (q.length < 3) {
      this.toast.warning('Enter at least 3 characters to search.');
      return;
    }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    const url = `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`;
    this.http.get<Taxpayer[]>(url)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        next: (data) => {
          this.searchResults = data;
          this.showResults   = true;
          this.hasSearched   = true;
          if (data.length === 0) {
            this.toast.info('No taxpayer found. Check TIN, NID or name and try again.');
          }
        },
        error: () => this.toast.error('Search failed. Please try again.')
      });
  }

  selectTaxpayer(taxpayer: Taxpayer): void {
    if (!taxpayer.tinNumber) {
      this.toast.error('This taxpayer does not have a TIN yet. Issue a TIN first.');
      this.showResults = false;
      return;
    }

    this.selectedTaxpayer    = taxpayer;
    this.showResults         = false;
    this.form.taxpayerId     = taxpayer.id;
    this.form.tinNumber      = taxpayer.tinNumber || '';
    this.form.taxpayerName   = this.getDisplayName(taxpayer);

    this.toast.success(`"${this.form.taxpayerName}" auto-filled.`);
  }

  clearTaxpayer(): void {
    this.selectedTaxpayer  = null;
    this.searchQuery       = '';
    this.searchResults     = [];
    this.showResults       = false;
    this.hasSearched       = false;
    this.form.taxpayerId   = undefined;
    this.form.tinNumber    = '';
    this.form.taxpayerName = '';
    this.toast.info('Taxpayer cleared.');
  }

  // ── Validation ──

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber     &&
      this.form.taxpayerName  &&
      this.form.paymentType   &&
      this.form.paymentMethod &&
      this.form.amount > 0    &&
      this.form.bankName      &&
      this.form.paymentDate
    );
  }

  // ── Submit ──

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;

    this.http.post(API_ENDPOINTS.PAYMENTS.CREATE, this.form)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.toast.success('Payment recorded successfully!');
          setTimeout(() => this.router.navigate(['/payments']), 1500);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to record payment. Please try again.';
          this.toast.error(msg);
        }
      });
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.clearTaxpayer();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/payments']);
  }

  private getEmptyForm(): PaymentCreateRequest {
    return {
      taxpayerId:    undefined,
      tinNumber:     '',
      taxpayerName:  '',
      paymentType:   '',
      paymentMethod: '',
      amount:        0,
      bankName:      '',
      bankBranch:    '',
      accountNo:     '',
      chequeNo:      '',
      paymentDate:   new Date().toISOString().split('T')[0],
      valueDate:     new Date().toISOString().split('T')[0],
      referenceNo:   '',
      returnNo:      '',
      remarks:       ''
    };
  }
}