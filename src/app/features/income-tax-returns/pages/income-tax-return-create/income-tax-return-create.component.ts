import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturnCreateRequest } from '../../../../models/income-tax-return.model';
import { FiscalYear } from '../../../../models/fiscal-year.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

/** Shape returned by POST /api/income-tax-returns/preview */
interface TaxPreviewResult {
  taxableIncome:    number;
  effectiveRatePct: number;
  grossTax:         number;
}

@Component({
  selector: 'app-income-tax-return-create',
  templateUrl: './income-tax-return-create.component.html',
  styleUrls: ['./income-tax-return-create.component.css']
})
export class IncomeTaxReturnCreateComponent implements OnInit, OnDestroy {

  isLoading        = false;
  isPreviewLoading = false;
  private destroy$       = new Subject<void>();
  private previewTrigger$ = new Subject<void>();

  // ── Taxpayer search ──
  searchQuery       = '';
  isSearching       = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults       = false;
  hasSearched       = false;

  // ── Fiscal year — from backend ──
  assessmentYears: string[] = [];
  incomeYears: string[]     = [];

  itrCategories = ['Individual', 'Company', 'Partnership', 'NGO'];
  returnPeriods = ['Annual', 'Quarterly'];

  // ── Server tax preview ──
  previewResult: TaxPreviewResult | null = null;

  form: IncomeTaxReturnCreateRequest = this.getEmptyForm();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadActiveFiscalYear();
    this.bindSubmittedBy();
    this.setupPreviewDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Fiscal year ───────────────────────────────────────────────────────────

  private loadActiveFiscalYear(): void {
    this.http.get<FiscalYear>(API_ENDPOINTS.FISCAL_YEARS.ACTIVE)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fy) => {
          const [startYr] = fy.yearName.split('-').map(Number);
          this.assessmentYears = Array.from({ length: 5 }, (_, i) => {
            const y = startYr - i;
            return `${y}-${String(y + 1).slice(-2)}`;
          });
          this.incomeYears = this.assessmentYears.map(ay => {
            const [y] = ay.split('-').map(Number);
            return `${y - 1}-${String(y).slice(-2)}`;
          });
          this.form.assessmentYear = fy.yearName;
          this.form.incomeYear     = this.incomeYears[0];
          this.form.dueDate        = fy.incomeTaxDueDate;
        },
        error: () => {
          this.assessmentYears = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
          this.incomeYears     = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];
          this.toast.warning('Could not load active fiscal year — using defaults.');
        }
      });
  }

  // ── submittedBy — bound to logged-in user, not a free dropdown ───────────

  private bindSubmittedBy(): void {
    const user = this.authService.currentUser;
    if (user?.fullName) this.form.submittedBy = user.fullName;
  }

  // ── Tax preview debounce ──────────────────────────────────────────────────

  private setupPreviewDebounce(): void {
    this.previewTrigger$.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.callPreviewApi());
  }

  /** Bound to (ngModelChange) on grossIncome, exemptIncome, itrCategory */
  onIncomeChanged(): void { this.previewTrigger$.next(); }

  private callPreviewApi(): void {
    if ((this.form.grossIncome ?? 0) <= 0) { this.previewResult = null; return; }
    this.isPreviewLoading = true;
    this.http.post<TaxPreviewResult>(API_ENDPOINTS.INCOME_TAX_RETURNS.PREVIEW, {
      grossIncome:  this.form.grossIncome,
      exemptIncome: this.form.exemptIncome,
      itrCategory:  this.form.itrCategory,
    }).pipe(takeUntil(this.destroy$), finalize(() => (this.isPreviewLoading = false)))
      .subscribe({
        next:  (r) => { this.previewResult = r; },
        error: () => {}
      });
  }

  // ── Derived display values ────────────────────────────────────────────────

  get isAutoFilled(): boolean { return this.selectedTaxpayer !== null; }

  get taxableIncome(): number {
    return this.previewResult?.taxableIncome
      ?? Math.max(0, (this.form.grossIncome ?? 0) - (this.form.exemptIncome ?? 0));
  }

  get serverGrossTax(): number  { return this.previewResult?.grossTax ?? 0; }

  get netTaxPayable(): number {
    return Math.max(0, this.serverGrossTax - (this.form.taxRebate ?? 0));
  }

  get balanceDue(): number {
    return Math.max(0, this.netTaxPayable
      - (this.form.advanceTaxPaid ?? 0)
      - (this.form.withholdingTax ?? 0)
      - (this.form.taxPaid        ?? 0));
  }

  get refundable(): number {
    const paid = (this.form.advanceTaxPaid ?? 0)
               + (this.form.withholdingTax ?? 0)
               + (this.form.taxPaid        ?? 0);
    return Math.max(0, paid - this.netTaxPayable);
  }

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    return tp.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? (tp.companyName || 'Unknown Company')
      : (tp.fullName    || 'Unknown Individual');
  }

  // ── Taxpayer search ───────────────────────────────────────────────────────

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = []; this.showResults = false; this.hasSearched = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q) { this.toast.warning('Enter TIN number, NID or taxpayer name to search.'); return; }
    if (q.length < 3) { this.toast.warning('Enter at least 3 characters to search.'); return; }
    this.isSearching = true; this.showResults = false; this.hasSearched = false;
    this.http.get<Taxpayer[]>(`${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        next: (data) => {
          this.searchResults = data; this.showResults = true; this.hasSearched = true;
          if (data.length === 0) this.toast.info('No taxpayer found. Check TIN, NID or name and try again.');
        },
        error: () => this.toast.error('Search failed. Please try again.')
      });
  }

  selectTaxpayer(taxpayer: Taxpayer): void {
    if (!taxpayer.tinNumber) {
      this.toast.error('This taxpayer does not have a TIN yet. Issue a TIN first.');
      this.showResults = false; return;
    }
    this.selectedTaxpayer  = taxpayer;
    this.showResults       = false;
    this.form.tinNumber    = taxpayer.tinNumber;
    this.form.taxpayerName = this.getDisplayName(taxpayer);
    this.form.itrCategory  = taxpayer.taxpayerType?.typeName?.toLowerCase().includes('company')
                               ? 'Company' : 'Individual';
    this.onIncomeChanged();
    this.toast.success(`"${this.form.taxpayerName}" auto-filled. Complete the tax details to continue.`);
  }

  clearSelectedTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.searchQuery = ''; this.searchResults = [];
    this.showResults = false; this.hasSearched = false;
    this.previewResult = null;
    this.form = this.getEmptyForm();
    this.bindSubmittedBy();
    this.toast.info('Taxpayer cleared.');
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  isFormValid(): boolean {
    return !!(this.form.tinNumber && this.form.taxpayerName &&
              this.form.itrCategory && this.form.assessmentYear);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.toast.warning('Please fill all required fields.'); return; }
    this.isLoading = true;
    this.http.post(API_ENDPOINTS.INCOME_TAX_RETURNS.CREATE, {
      ...this.form,
      taxpayerId: this.selectedTaxpayer?.id,
    }).pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.toast.success('Income tax return filed successfully!');
          setTimeout(() => this.router.navigate(['/income-tax-returns']), 1500);
        },
        error: (err) => {
          if (err.status === 409)
            this.toast.error(err.error?.message || 'A return for this TIN and assessment year already exists.');
        }
      });
  }

  onReset(): void  { this.clearSelectedTaxpayer(); this.toast.info('Form has been reset.'); }
  onCancel(): void { this.router.navigate(['/income-tax-returns']); }

  private getEmptyForm(): IncomeTaxReturnCreateRequest {
    return {
      tinNumber: '', taxpayerName: '', itrCategory: 'Individual',
      assessmentYear: '', incomeYear: '', returnPeriod: 'Annual',
      grossIncome: 0, exemptIncome: 0, taxRate: 0, grossTax: 0,
      taxRebate: 0, advanceTaxPaid: 0, withholdingTax: 0, taxPaid: 0,
      submissionDate: new Date().toISOString().split('T')[0],
      dueDate: '', submittedBy: '', remarks: ''
    };
  }
}