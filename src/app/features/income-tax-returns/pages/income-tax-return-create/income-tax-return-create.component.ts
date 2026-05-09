import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { API_ENDPOINTS }   from '../../../../core/constants/api.constants';
import { FiscalYear }      from '../../../../models/fiscal-year.model';
import { Taxpayer }        from '../../../../models/taxpayer.model';
import { ToastService }    from 'src/app/shared/toast/toast.service';
import { AuthService }     from '../../../../core/services/auth.service';
import { Role }            from '../../../../core/constants/roles.constants';

interface TaxBracket {
  label:        string;
  rate:         number;   
  incomeInSlab: number;
  taxInSlab:    number;
  active:       boolean;
}

@Component({
  selector:    'app-income-tax-return-create',
  templateUrl: './income-tax-return-create.component.html',
  styleUrls:   ['./income-tax-return-create.component.css']
})
export class IncomeTaxReturnCreateComponent implements OnInit, OnDestroy {

  // ── Wizard state ──────────────────────────────────────────────────────────
  currentStep = 1;

  // ── Step forms ────────────────────────────────────────────────────────────
  step1Form!: FormGroup;  // Taxpayer profile
  step2Form!: FormGroup;  // Income sources
  step3Form!: FormGroup;  // Deductions
  step5Form!: FormGroup;  // Assets & liabilities
  step6Form!: FormGroup;  // Declaration / remarks

  // ── Dropdown data ─────────────────────────────────────────────────────────
  assessmentYears: string[] = [];
  incomeYears:     string[] = [];
  readonly itrCategories  = ['Individual', 'Company', 'Partnership', 'NGO'];
  readonly returnPeriods  = ['Annual', 'Quarterly'];
  readonly companySubTypes = [
    'Private Limited', 'Publicly Traded Listed',
    'Bank', 'NBFI', 'Mobile Operator', 'NGO'
  ];

  // ── Taxpayer search (officer path) ────────────────────────────────────────
  searchQuery     = '';
  isSearching     = false;
  searchResults:   Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults     = false;
  hasSearched     = false;

  // ── Submission state ──────────────────────────────────────────────────────
  isLoading = false;
  successData: { returnNo: string; returnId: number; filedAt: string } | null = null;

  // ── Fiscal year meta ──────────────────────────────────────────────────────
  dueDate    = '';
  filingYear = '';

  private destroy$ = new Subject<void>();

  // BD individual tax slabs (FY 2024-25)
  private readonly BD_SLABS = [
    { label: 'First ৳ 3,50,000',    limit: 350000,   rate: 0    },
    { label: 'Next ৳ 1,00,000',     limit: 100000,   rate: 0.05 },
    { label: 'Next ৳ 3,00,000',     limit: 300000,   rate: 0.10 },
    { label: 'Next ৳ 4,00,000',     limit: 400000,   rate: 0.15 },
    { label: 'Next ৳ 5,00,000',     limit: 500000,   rate: 0.20 },
    { label: 'Above ৳ 16,50,000',   limit: Infinity,  rate: 0.25 },
  ];

  constructor(
    private fb:          FormBuilder,
    private http:        HttpClient,
    private route:       ActivatedRoute,
    private router:      Router,
    private toast:       ToastService,
    public  authService: AuthService
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
    this.step1Form = this.fb.group({
      tinNumber:      ['', Validators.required],
      taxpayerName:   ['', Validators.required],
      itrCategory:    ['Individual', Validators.required],
      companySubType: [''],
      returnPeriod:   ['Annual'],
      assessmentYear: ['', Validators.required],
      incomeYear:     [''],
      submissionDate: [new Date().toISOString().split('T')[0]],
      dueDate:        [''],
    });

    this.step2Form = this.fb.group({
      salBasic:     [0, Validators.min(0)],
      hra:          [0, Validators.min(0)],
      bonus:        [0, Validators.min(0)],
      salTds:       [0, Validators.min(0)],
      bizIncome:    [0, Validators.min(0)],
      bankInterest: [0, Validators.min(0)],
      bankAit:      [0, Validators.min(0)],
      rentIncome:   [0, Validators.min(0)],
      capitalGain:  [0, Validators.min(0)],
    });

    this.step3Form = this.fb.group({
      lifeInsurance: [0, Validators.min(0)],
      providentFund: [0, Validators.min(0)],
      dps:           [0, Validators.min(0)],
      govtBonds:     [0, Validators.min(0)],
      donation:      [0, Validators.min(0)],
      shares:        [0, Validators.min(0)],
    });

    this.step5Form = this.fb.group({
      landBuilding:     [0, Validators.min(0)],
      motorVehicle:     [0, Validators.min(0)],
      businessCapital:  [0, Validators.min(0)],
      bankBalance:      [0, Validators.min(0)],
      cashInHand:       [0, Validators.min(0)],
      investment:       [0, Validators.min(0)],
      gold:             [0, Validators.min(0)],
      otherAssets:      [0, Validators.min(0)],
      bankLoan:         [0, Validators.min(0)],
      bizLoan:          [0, Validators.min(0)],
      otherLiabilities: [0, Validators.min(0)],
    });

    this.step6Form = this.fb.group({
      declaration: [false, Validators.requiredTrue],
      remarks:     [''],
    });
  }

  // ── Convenience value accessors ───────────────────────────────────────────

  private get v2() { return this.step2Form.value; }
  private get v3() { return this.step3Form.value; }
  private get v5() { return this.step5Form.value; }

  // ── Income computed values (step 2) ───────────────────────────────────────

  get salGross():      number { return (this.v2.salBasic||0)+(this.v2.hra||0)+(this.v2.bonus||0); }
  get salBasicNet():   number { return (this.v2.salBasic||0)-(this.v2.salTds||0); }
  get salNet():        number { return this.salGross-(this.v2.salTds||0); }
  get bizNet():        number { return this.v2.bizIncome||0; }
  get bankNet():       number { return (this.v2.bankInterest||0)-(this.v2.bankAit||0); }
  get rentNet():       number { return this.v2.rentIncome||0; }
  get capGainNet():    number { return this.v2.capitalGain||0; }

  get totalGrossIncome(): number {
    return this.salGross +
           (this.v2.bizIncome||0) +
           (this.v2.bankInterest||0) +
           (this.v2.rentIncome||0) +
           (this.v2.capitalGain||0);
  }
  get totalTds():  number { return (this.v2.salTds||0)+(this.v2.bankAit||0); }
  get grandNet():  number { return this.totalGrossIncome - this.totalTds; }

  // ── Deduction computed values (step 3) ────────────────────────────────────

  get dpsEffective():    number { return Math.min(this.v3.dps||0, 60000); }
  get sharesEffective(): number { return Math.min(this.v3.shares||0, 50000); }

  get totalDeductions(): number {
    return (this.v3.lifeInsurance||0) +
           (this.v3.providentFund||0) +
           this.dpsEffective +
           (this.v3.govtBonds||0) +
           (this.v3.donation||0) +
           this.sharesEffective;
  }
  get taxRebate(): number { return this.totalDeductions * 0.15; }

  // ── Tax computation (step 4) ──────────────────────────────────────────────

  /** HRA exemption: 50% of HRA, max ৳ 50,000 */
  get hraExemption(): number {
    return Math.min((this.v2.hra||0) * 0.5, 50000);
  }

  get localTaxableIncome(): number {
    return Math.max(0, this.totalGrossIncome - this.hraExemption);
  }

  get computedBrackets(): TaxBracket[] {
    let remaining = this.localTaxableIncome;
    return this.BD_SLABS.map(slab => {
      const inSlab = slab.limit === Infinity
        ? remaining
        : Math.min(remaining, slab.limit);
      const tax = inSlab * slab.rate;
      remaining = Math.max(0, remaining - inSlab);
      return {
        label:        slab.label,
        rate:         slab.rate * 100,
        incomeInSlab: inSlab,
        taxInSlab:    tax,
        active:       inSlab > 0,
      };
    });
  }

  get localGrossTax(): number {
    return this.computedBrackets.reduce((s, b) => s + b.taxInSlab, 0);
  }
  get localNetTax():  number { return Math.max(0, this.localGrossTax - this.taxRebate); }

  /** Positive = amount due; negative = refund */
  get taxResult():   number { return this.localNetTax - this.totalTds; }
  get balanceDue():  number { return Math.max(0,  this.taxResult); }
  get refundable():  number { return Math.max(0, -this.taxResult); }

  // ── Assets & liabilities computed values (step 5) ─────────────────────────

  get totalAssets(): number {
    return (this.v5.landBuilding||0) + (this.v5.motorVehicle||0) +
           (this.v5.businessCapital||0) + (this.v5.bankBalance||0) +
           (this.v5.cashInHand||0) + (this.v5.investment||0) +
           (this.v5.gold||0) + (this.v5.otherAssets||0);
  }
  get totalLiabilities(): number {
    return (this.v5.bankLoan||0) + (this.v5.bizLoan||0) + (this.v5.otherLiabilities||0);
  }
  get netWorth(): number { return this.totalAssets - this.totalLiabilities; }

  // ── Role helpers ──────────────────────────────────────────────────────────

  get isTaxpayerRole():  boolean { return this.authService.currentUser?.role === Role.TAXPAYER; }
  get isAutoFilled():    boolean { return this.selectedTaxpayer !== null; }
  get isCompanyCategory(): boolean {
    return this.step1Form?.get('itrCategory')?.value === 'Company';
  }

  // ── Fiscal year loader ────────────────────────────────────────────────────

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
          this.dueDate    = fy.incomeTaxDueDate || '';
          this.filingYear = fy.yearName;
          this.step1Form.patchValue({
            assessmentYear: fy.yearName,
            incomeYear:     this.incomeYears[0],
            dueDate:        fy.incomeTaxDueDate,
          });
        },
        error: () => {
          this.assessmentYears = ['2025-26','2024-25','2023-24','2022-23','2021-22'];
          this.incomeYears     = ['2024-25','2023-24','2022-23','2021-22','2020-21'];
          this.filingYear      = '2025-26';
          this.toast.warning('Could not load active fiscal year — using defaults.');
        }
      });
  }

  // ── Role-aware prefill ────────────────────────────────────────────────────

  private prefillForTaxpayerRole(): void {
    if (!this.isTaxpayerRole) return;
    const user = this.authService.currentUser!;
    this.step1Form.patchValue({ taxpayerName: user.fullName });
    this.step1Form.get('taxpayerName')?.disable();
  }

  // ── Taxpayer search (officer path) ────────────────────────────────────────

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults   = false;
      this.hasSearched   = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q || q.length < 3) { this.toast.warning('Enter at least 3 characters.'); return; }
    this.isSearching = true;
    this.showResults = false;
    this.http.get<Taxpayer[]>(`${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isSearching = false))
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
    if (!t.tinNumber) {
      this.toast.error('Taxpayer has no TIN yet — issue a TIN first.');
      this.showResults = false;
      return;
    }
    this.selectedTaxpayer = t;
    this.showResults      = false;
    const name = this.getDisplayName(t);
    const cat  = t.taxpayerType?.typeName?.toLowerCase().includes('company') ? 'Company' : 'Individual';
    this.step1Form.patchValue({ tinNumber: t.tinNumber, taxpayerName: name, itrCategory: cat });
    ['tinNumber','taxpayerName','itrCategory'].forEach(c => this.step1Form.get(c)?.disable());
    this.toast.success(`"${name}" selected — profile auto-filled.`);
  }

  clearSelectedTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.searchQuery      = '';
    this.searchResults    = [];
    this.showResults      = false;
    this.hasSearched      = false;
    ['tinNumber','taxpayerName','itrCategory'].forEach(c => this.step1Form.get(c)?.enable());
    this.step1Form.patchValue({ tinNumber: '', taxpayerName: '', itrCategory: 'Individual' });
  }

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    return tp.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? tp.companyName || 'Unknown Company'
      : tp.fullName    || 'Unknown Individual';
  }

  // ── Wizard navigation ─────────────────────────────────────────────────────

  goToStep(target: number): void {
    // Back-navigation always allowed
    if (target < this.currentStep) { this.currentStep = target; return; }

    // Forward: validate current step
    if (this.currentStep === 1 && !this.step1Form.valid) {
      this.step1Form.markAllAsTouched();
      this.toast.warning('Please complete all required fields before continuing.');
      return;
    }
    if (this.currentStep === 2 && this.totalGrossIncome <= 0) {
      this.toast.warning('Please enter at least one income source.');
      return;
    }
    this.currentStep = target;
  }

  nextStep(): void { this.goToStep(this.currentStep + 1); }
  prevStep(): void { this.currentStep = Math.max(1, this.currentStep - 1); }

  getStepState(step: number): 'done' | 'active' | 'todo' {
    if (step < this.currentStep) return 'done';
    if (step === this.currentStep) return 'active';
    return 'todo';
  }

  private get returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl')
      || '/income-tax-returns';
  }

  getStatusLabel(): string {
    const m: Record<number, string> = {
      1: 'Draft', 2: 'Draft', 3: 'Draft',
      4: 'Calculating', 5: 'Draft', 6: 'Ready', 7: 'Submitted'
    };
    return m[this.currentStep] ?? 'Draft';
  }

  getStatusClass(): string {
    const m: Record<string, string> = {
      Draft: 'b-draft', Calculating: 'b-info', Ready: 'b-warn', Submitted: 'b-ok'
    };
    return m[this.getStatusLabel()] ?? 'b-draft';
  }

  // ── Final submission ──────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.step6Form.get('declaration')?.value) {
      this.toast.warning('Please confirm the declaration before submitting.');
      return;
    }

    this.isLoading = true;
    const s1 = this.step1Form.getRawValue(); // includes disabled fields

    const payload = {
      tinNumber:      s1.tinNumber,
      taxpayerName:   s1.taxpayerName,
      itrCategory:    s1.itrCategory,
      companySubType: s1.companySubType || '',
      returnPeriod:   s1.returnPeriod,
      assessmentYear: s1.assessmentYear,
      incomeYear:     s1.incomeYear,
      submissionDate: s1.submissionDate,
      dueDate:        s1.dueDate,
      // Aggregated from granular step-2 fields — no backend model change needed
      grossIncome:    this.totalGrossIncome,
      exemptIncome:   this.hraExemption,
      taxRebate:      this.taxRebate,
      advanceTaxPaid: this.v2.salTds  || 0,
      withholdingTax: this.v2.bankAit || 0,
      taxPaid:        0,
      remarks:        this.step6Form.value.remarks || '',
      submittedBy:    this.authService.currentUser?.fullName ?? '',
      // Fix: TAXPAYER role gets their taxpayerId from the auth session
      taxpayerId: this.selectedTaxpayer?.id ?? this.authService.currentUser?.taxpayerId,
    };

    this.http.post<any>(API_ENDPOINTS.INCOME_TAX_RETURNS.CREATE, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false))
      .subscribe({
        next: (itr) => {
          this.successData = {
            returnNo: itr.returnNo,
            returnId: itr.id,
            filedAt:  new Date().toLocaleString('en-BD'),
          };
          // If assets were entered in step 5, submit IT10B inline
          if (this.totalAssets > 0) {
            this.submitIT10B(itr.id);
          } else {
            this.currentStep = 7;
          }
        },
        error: (err) => {
          if (err.status === 409)
            this.toast.error(err.error?.message || 'A return for this TIN and assessment year already exists.');
          else
            this.toast.error('Submission failed. Please try again.');
        }
      });
  }

  private submitIT10B(returnId: number): void {
    const v = this.v5;
    // Map granular step-5 fields → IT10B backend fields (no backend change)
    const payload = {
      returnId,
      nonAgriculturalProperty: (v.landBuilding||0) + (v.businessCapital||0) + (v.gold||0) + (v.otherAssets||0),
      agriculturalProperty:    0,
      investments:             v.investment || 0,
      motorVehicles:           v.motorVehicle || 0,
      bankBalances:            (v.bankBalance||0) + (v.cashInHand||0),
      personalLiabilities:     (v.bankLoan||0) + (v.bizLoan||0) + (v.otherLiabilities||0),
    };

    this.http.post(API_ENDPOINTS.IT10B.CREATE, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  () => { this.currentStep = 7; },
        error: () => {
          // ITR saved, IT10B failed — still show success but warn
          this.toast.warning('ITR filed. Assets statement could not be saved — file IT-10B separately from the return view.');
          this.currentStep = 7;
        }
      });
  }

  // ── Navigation helpers ────────────────────────────────────────────────────

  onCancel(): void {
    this.router.navigate([this.returnUrl]);
  }
  goToList(): void {
    this.router.navigate([this.returnUrl]);
  }
 
  goToView(): void {
    if (this.successData) {
      // Pass returnUrl forward so the view page also knows where to go back
      this.router.navigate(
        ['/income-tax-returns/view', this.successData.returnId],
        { queryParams: { returnUrl: this.returnUrl } }
      );
    }
  }

  // ── Formatting helpers ────────────────────────────────────────────────────

  fmt(val: number): string {
    return '৳ ' + Math.round(val || 0).toLocaleString('en-IN');
  }
  fmtN(val: number): string {
    return Math.round(val || 0).toLocaleString('en-IN');
  }
}