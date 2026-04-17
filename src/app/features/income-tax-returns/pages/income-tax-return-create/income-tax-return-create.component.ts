import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturnCreateRequest } from '../../../../models/income-tax-return.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { Tin } from '../../../../models/tin.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-income-tax-return-create',
  templateUrl: './income-tax-return-create.component.html',
  styleUrls: ['./income-tax-return-create.component.css']
})
export class IncomeTaxReturnCreateComponent implements OnDestroy {

  isLoading = false;
  private destroy$ = new Subject<void>();

  // ── Taxpayer / TIN Search ──
  searchQuery     = '';
  isSearching     = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  selectedTin: Tin | null = null;
  showResults     = false;
  hasSearched     = false;

  // ── Dropdown Data ──
  itrCategories   = ['Individual', 'Company', 'Partnership', 'NGO'];
  returnPeriods   = ['Annual', 'Quarterly'];
  assessmentYears = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
  incomeYears     = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];
  submitters      = ['Taxpayer', 'Tax Officer', 'Data Entry Operator', 'Tax Commissioner'];

  taxRates: Record<string, number[]> = {
    'Individual':  [0, 5, 10, 15, 20, 25],
    'Company':     [20, 22.5, 25, 27.5, 30, 32.5],
    'Partnership': [25, 30],
    'NGO':         [15, 20]
  };

  form: IncomeTaxReturnCreateRequest = this.getEmptyForm();

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

  get availableTaxRates(): number[] {
    return this.taxRates[this.form.itrCategory] || [0, 5, 10, 15, 20, 25];
  }

  get taxableIncome(): number {
    return Math.max(0, (this.form.grossIncome || 0) - (this.form.exemptIncome || 0));
  }

  get netTaxPayable(): number {
    return Math.max(0, (this.form.grossTax || 0) - (this.form.taxRebate || 0));
  }

  get balanceDue(): number {
    return Math.max(0, this.netTaxPayable
      - (this.form.advanceTaxPaid || 0)
      - (this.form.withholdingTax || 0)
      - (this.form.taxPaid || 0));
  }

  get refundable(): number {
    const totalPaid = (this.form.advanceTaxPaid || 0)
      + (this.form.withholdingTax || 0)
      + (this.form.taxPaid || 0);
    return Math.max(0, totalPaid - this.netTaxPayable);
  }

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    const type = tp.taxpayerType?.typeName?.toLowerCase() || '';
    return type.includes('company')
      ? (tp.companyName || 'Unknown Company')
      : (tp.fullName || 'Unknown Individual');
  }

  // ── Search ──

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

    this.isSearching  = true;
    this.showResults  = false;
    this.hasSearched  = false;

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

    this.selectedTaxpayer       = taxpayer;
    this.showResults            = false;

    const type = taxpayer.taxpayerType?.typeName?.toLowerCase() || '';
    const isCompany = type.includes('company');

    // Auto-fill form
    this.form.tinNumber     = taxpayer.tinNumber || '';
    this.form.taxpayerName  = this.getDisplayName(taxpayer);
    this.form.itrCategory   = isCompany ? 'Company' : 'Individual';

    this.toast.success(`"${this.form.taxpayerName}" auto-filled. Complete the tax details to continue.`);
  }

  clearSelectedTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.selectedTin      = null;
    this.searchQuery      = '';
    this.searchResults    = [];
    this.showResults      = false;
    this.hasSearched      = false;
    this.form             = this.getEmptyForm();
    this.toast.info('Taxpayer cleared.');
  }

  // ── Tax Calculation ──

  autoCalcTax(): void {
    this.form.grossTax = Math.round(this.taxableIncome * this.form.taxRate / 100);
  }

  // ── Validation ──

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber &&
      this.form.taxpayerName &&
      this.form.itrCategory &&
      this.form.assessmentYear
    );
  }

  // ── Submit ──

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill all required fields.');
      return;
    }

    this.isLoading = true;

    const payload = {
        ...this.form,
        taxpayerId: this.selectedTaxpayer?.id 
    };
    
    this.http.post(API_ENDPOINTS.INCOME_TAX_RETURNS.CREATE, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.toast.success('Income tax return filed successfully!');
          setTimeout(() => this.router.navigate(['/income-tax-returns']), 1500);
        },
        error: (err) => {
          if (err.status === 409) {
            this.toast.error(err.error?.message || 'A return for this TIN and assessment year already exists.');
          } else {
            this.toast.error('Failed to file income tax return. Please try again.');
          }
        }
      });
  }

  onReset(): void {
    this.clearSelectedTaxpayer();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/income-tax-returns']);
  }

  private getEmptyForm(): IncomeTaxReturnCreateRequest {
    return {
      tinNumber:      '',
      taxpayerName:   '',
      itrCategory:    'Individual',
      assessmentYear: '2025-26',
      incomeYear:     '2024-25',
      returnPeriod:   'Annual',
      grossIncome:    0,
      exemptIncome:   0,
      taxRate:        0,
      grossTax:       0,
      taxRebate:      0,
      advanceTaxPaid: 0,
      withholdingTax: 0,
      taxPaid:        0,
      submissionDate: new Date().toISOString().split('T')[0],
      dueDate:        '2025-11-30',
      submittedBy:    'Taxpayer',
      remarks:        ''
    };
  }
}
