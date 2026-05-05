import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { FiscalYear } from '../../../../models/fiscal-year.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';

/** Shape returned by POST /api/income-tax-returns/preview */
interface TaxPreviewResult {
  taxableIncome: number;
  grossTax: number;
  effectiveRatePct: number;
  netTaxPayable: number;
}

@Component({
  selector: 'app-income-tax-return-create',
  templateUrl: './income-tax-return-create.component.html',
  styleUrls: ['./income-tax-return-create.component.css'],
})
export class IncomeTaxReturnCreateComponent implements OnInit, OnDestroy {
  // ── Wizard state ─────────────────────────────────────────────────────────
  currentStep = 1;
  readonly TOTAL_STEPS = 4;

  // ── Step forms ───────────────────────────────────────────────────────────
  step1Form!: FormGroup; // Taxpayer Profile
  step2Form!: FormGroup; // Income Details
  step4Form!: FormGroup; // Remarks (step 3 is read-only, no form needed)

  // ── Dropdown data ────────────────────────────────────────────────────────
  assessmentYears: string[] = [];
  incomeYears: string[] = [];
  readonly itrCategories = ['Individual', 'Company', 'Partnership', 'NGO'];
  readonly returnPeriods = ['Annual', 'Quarterly'];
  readonly companySubTypes = [
    'Private Limited',
    'Publicly Traded Listed',
    'Bank',
    'NBFI',
    'Mobile Operator',
    'NGO',
  ];

  // ── Taxpayer search (officer path only) ──────────────────────────────────
  searchQuery = '';
  isSearching = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults = false;
  hasSearched = false;

  // ── Tax preview (step 3) ─────────────────────────────────────────────────
  isPreviewLoading = false;
  previewResult: TaxPreviewResult | null = null;
  previewError = false;

  // ── Submission state ─────────────────────────────────────────────────────
  isLoading = false;

  private destroy$ = new Subject<void>();

  // ── Role helpers ─────────────────────────────────────────────────────────

  /** True when the logged-in user is a TAXPAYER self-filing. */
  get isTaxpayerRole(): boolean {
    return this.authService.currentUser?.role === Role.TAXPAYER;
  }

  /** True once a taxpayer has been locked in (officer selected via search). */
  get isAutoFilled(): boolean {
    return this.selectedTaxpayer !== null;
  }

  /** True when the category in step1 is Company — shows the sub-type field. */
  get isCompanyCategory(): boolean {
    return this.step1Form?.get('itrCategory')?.value === 'Company';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Constructor — Angular 13 constructor injection (no inject() function)
  // ─────────────────────────────────────────────────────────────────────────

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    public authService: AuthService,
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForms();
    this.loadActiveFiscalYear();
    this.prefillForTaxpayerRole();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form construction ─────────────────────────────────────────────────────

  private buildForms(): void {
    // Step 1 — Taxpayer Profile
    this.step1Form = this.fb.group({
      tinNumber: ['', Validators.required],
      taxpayerName: ['', Validators.required],
      itrCategory: ['Individual', Validators.required],
      companySubType: [''],
      returnPeriod: ['Annual', Validators.required],
      assessmentYear: ['', Validators.required],
      incomeYear: [''],
      submissionDate: [new Date().toISOString().split('T')[0]],
      dueDate: [''],
    });

    // Step 2 — Income Details
    this.step2Form = this.fb.group({
      grossIncome: [0, [Validators.required, Validators.min(1)]],
      exemptIncome: [0, [Validators.required, Validators.min(0)]],
      taxRebate: [0, [Validators.required, Validators.min(0)]],
      advanceTaxPaid: [0, [Validators.required, Validators.min(0)]],
      withholdingTax: [0, [Validators.required, Validators.min(0)]],
      taxPaid: [0, [Validators.required, Validators.min(0)]],
    });

    // Step 4 — Remarks only; submittedBy is assigned from authService on submit
    this.step4Form = this.fb.group({
      remarks: [''],
    });
  }

  // ── Role-aware prefill ────────────────────────────────────────────────────

  private prefillForTaxpayerRole(): void {
    if (!this.isTaxpayerRole) return;
    const user = this.authService.currentUser!;
    // Auto-fill name from the session; TIN the taxpayer enters themselves
    this.step1Form.patchValue({ taxpayerName: user.fullName });
    // Lock name so the taxpayer cannot alter their own identity
    this.step1Form.get('taxpayerName')?.disable();
  }

  // ── Fiscal year loader ────────────────────────────────────────────────────

  private loadActiveFiscalYear(): void {
    this.http
      .get<FiscalYear>(API_ENDPOINTS.FISCAL_YEARS.ACTIVE)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fy) => {
          const [startYr] = fy.yearName.split('-').map(Number);
          this.assessmentYears = Array.from({ length: 5 }, (_, i) => {
            const y = startYr - i;
            return `${y}-${String(y + 1).slice(-2)}`;
          });
          this.incomeYears = this.assessmentYears.map((ay) => {
            const [y] = ay.split('-').map(Number);
            return `${y - 1}-${String(y).slice(-2)}`;
          });
          this.step1Form.patchValue({
            assessmentYear: fy.yearName,
            incomeYear: this.incomeYears[0],
            dueDate: fy.incomeTaxDueDate,
          });
        },
        error: () => {
          this.assessmentYears = [
            '2025-26',
            '2024-25',
            '2023-24',
            '2022-23',
            '2021-22',
          ];
          this.incomeYears = [
            '2024-25',
            '2023-24',
            '2022-23',
            '2021-22',
            '2020-21',
          ];
          this.toast.warning(
            'Could not load active fiscal year — using defaults.',
          );
        },
      });
  }

  // ── Taxpayer search (officer path) ────────────────────────────────────────

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults = false;
      this.hasSearched = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.toast.warning('Enter TIN, NID or name to search.');
      return;
    }
    if (q.length < 3) {
      this.toast.warning('Enter at least 3 characters.');
      return;
    }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    this.http
      .get<Taxpayer[]>(
        `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`,
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSearching = false)),
      )
      .subscribe({
        next: (data) => {
          this.searchResults = data;
          this.showResults = true;
          this.hasSearched = true;
          if (!data.length) this.toast.info('No taxpayer found.');
        },
        error: () => this.toast.error('Search failed. Please try again.'),
      });
  }

  selectTaxpayer(t: Taxpayer): void {
    if (!t.tinNumber) {
      this.toast.error(
        'This taxpayer does not have a TIN yet. Issue a TIN first.',
      );
      this.showResults = false;
      return;
    }

    this.selectedTaxpayer = t;
    this.showResults = false;

    const name = this.getDisplayName(t);
    const category = t.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? 'Company'
      : 'Individual';

    this.step1Form.patchValue({
      tinNumber: t.tinNumber,
      taxpayerName: name,
      itrCategory: category,
    });
    // Lock fields so officer cannot accidentally overwrite the auto-filled data
    this.step1Form.get('tinNumber')?.disable();
    this.step1Form.get('taxpayerName')?.disable();
    this.step1Form.get('itrCategory')?.disable();

    this.toast.success(`"${name}" auto-filled. Continue to Step 2.`);
  }

  clearSelectedTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
    this.hasSearched = false;

    // Re-enable locked fields
    ['tinNumber', 'taxpayerName', 'itrCategory'].forEach((c) =>
      this.step1Form.get(c)?.enable(),
    );
    this.step1Form.patchValue({
      tinNumber: '',
      taxpayerName: '',
      itrCategory: 'Individual',
    });
    this.toast.info('Taxpayer cleared.');
  }

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    return tp.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? tp.companyName || 'Unknown Company'
      : tp.fullName || 'Unknown Individual';
  }

  // ── Step validation guards ─────────────────────────────────────────────────

  get isStep1Valid(): boolean {
    return this.step1Form.valid;
  }
  get isStep2Valid(): boolean {
    return this.step2Form.valid;
  }

  // ── Wizard navigation ──────────────────────────────────────────────────────

  /**
   * Navigate to a specific step.
   * Going backward is always allowed; going forward enforces validation.
   */
  goToStep(target: number): void {
    // Back-navigation — always permitted
    if (target < this.currentStep) {
      this.currentStep = target;
      return;
    }

    // Forward: validate current step before allowing advance
    if (this.currentStep === 1 && !this.isStep1Valid) {
      this.step1Form.markAllAsTouched();
      this.toast.warning(
        'Please complete all required fields before continuing.',
      );
      return;
    }
    if (this.currentStep === 2 && !this.isStep2Valid) {
      this.step2Form.markAllAsTouched();
      this.toast.warning('Please fix the income fields before continuing.');
      return;
    }

    // Entering Step 3 triggers the preview API call
    if (target === 3) {
      this.currentStep = 3;
      this.callPreviewApi();
      return;
    }

    this.currentStep = target;
  }

  nextStep(): void {
    this.goToStep(this.currentStep + 1);
  }
  prevStep(): void {
    this.currentStep = Math.max(1, this.currentStep - 1);
  }

  // ── Tax preview — Step 3 HTTP call ───────────────────────────────────────

  /** Called only when the user enters Step 3. No debounce needed. */
  private callPreviewApi(): void {
    this.previewResult = null;
    this.previewError = false;
    this.isPreviewLoading = true;

    const s1 = this.step1Form.getRawValue(); // getRawValue includes disabled controls
    const s2 = this.step2Form.value;

    this.http
      .post<TaxPreviewResult>(API_ENDPOINTS.INCOME_TAX_RETURNS.PREVIEW, {
        grossIncome: s2.grossIncome,
        exemptIncome: s2.exemptIncome,
        itrCategory: s1.itrCategory,
        companySubType: s1.companySubType,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isPreviewLoading = false)),
      )
      .subscribe({
        next: (r) => {
          this.previewResult = r;
        },
        error: () => {
          this.previewError = true;
          this.toast.error(
            'Tax preview failed. Go back and check your income figures.',
          );
        },
      });
  }

  retryPreview(): void {
    this.callPreviewApi();
  }

  // ── Computed display values (used in Step 3 & Step 4 review) ─────────────

  get serverGrossTax(): number {
    return this.previewResult?.grossTax ?? 0;
  }
  get serverTaxableIncome(): number {
    return this.previewResult?.taxableIncome ?? 0;
  }
  get serverEffectiveRate(): number {
    return this.previewResult?.effectiveRatePct ?? 0;
  }

  get netTaxPayable(): number {
    return Math.max(
      0,
      this.serverGrossTax - (this.step2Form.value.taxRebate ?? 0),
    );
  }

  get balanceDue(): number {
    return Math.max(
      0,
      this.netTaxPayable -
        (this.step2Form.value.advanceTaxPaid ?? 0) -
        (this.step2Form.value.withholdingTax ?? 0) -
        (this.step2Form.value.taxPaid ?? 0),
    );
  }

  get refundable(): number {
    const paid =
      (this.step2Form.value.advanceTaxPaid ?? 0) +
      (this.step2Form.value.withholdingTax ?? 0) +
      (this.step2Form.value.taxPaid ?? 0);
    return Math.max(0, paid - this.netTaxPayable);
  }

  // ── Submission ────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.previewResult) {
      this.toast.warning(
        'Tax computation result is missing. Please go back to Step 3.',
      );
      return;
    }
    if (this.step4Form.invalid) {
      this.step4Form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const s1 = this.step1Form.getRawValue(); // includes disabled fields
    const s2 = this.step2Form.value;
    const s4 = this.step4Form.value;

    const payload = {
      // Profile
      tinNumber: s1.tinNumber,
      taxpayerName: s1.taxpayerName,
      itrCategory: s1.itrCategory,
      companySubType: s1.companySubType,
      returnPeriod: s1.returnPeriod,
      assessmentYear: s1.assessmentYear,
      incomeYear: s1.incomeYear,
      submissionDate: s1.submissionDate,
      dueDate: s1.dueDate,
      // Income
      grossIncome: s2.grossIncome,
      exemptIncome: s2.exemptIncome,
      taxRebate: s2.taxRebate,
      advanceTaxPaid: s2.advanceTaxPaid,
      withholdingTax: s2.withholdingTax,
      taxPaid: s2.taxPaid,
      // Submission
      remarks: s4.remarks,
      // Auto-assigned from session — never from a free-text field
      submittedBy: this.authService.currentUser?.fullName ?? '',
      // Taxpayer FK (officer path only; TAXPAYER role leaves this undefined)
      taxpayerId: this.selectedTaxpayer?.id,
    };

    this.http
      .post(API_ENDPOINTS.INCOME_TAX_RETURNS.CREATE, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('Income tax return filed successfully!');
          setTimeout(() => this.router.navigate(['/income-tax-returns']), 1500);
        },
        error: (err) => {
          if (err.status === 409) {
            this.toast.error(
              err.error?.message ||
                'A return for this TIN and assessment year already exists.',
            );
          } else {
            this.toast.error('Submission failed. Please try again.');
          }
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/income-tax-returns']);
  }
}
