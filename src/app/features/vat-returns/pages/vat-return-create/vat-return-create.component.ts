import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistration } from '../../../../models/vat-registration.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-vat-return-create',
  templateUrl: './vat-return-create.component.html',
  styleUrls: ['./vat-return-create.component.css']
})
export class VatReturnCreateComponent implements OnDestroy {

  form!: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  // ── VAT Registration Search ──────────────────────────────────────────────
  searchQuery          = '';
  isSearching          = false;
  searchResults: VatRegistration[] = [];
  selectedReg: VatRegistration | null = null;
  showResults          = false;
  hasSearched          = false;

  // ── Dropdown Data ────────────────────────────────────────────────────────
  returnPeriods   = ['Monthly', 'Quarterly', 'Annually'];
  months          = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
  quarters        = ['Q1','Q2','Q3','Q4'];
  years           = ['2025','2024','2023','2022','2021'];
  assessmentYears = ['2025-26','2024-25','2023-24','2022-23'];
  submitters      = ['Taxpayer','Tax Officer','Data Entry Operator','Tax Commissioner'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      vatRegistrationId: [null, Validators.required],
      returnPeriod:      ['Monthly', Validators.required],
      periodMonth:       ['', Validators.required],
      periodYear:        ['2025', Validators.required],
      assessmentYear:    ['2025-26'],
      submissionDate:    [new Date().toISOString().split('T')[0]],
      dueDate:           [''],
      taxableSupplies:   [0, Validators.min(0)],
      exemptSupplies:    [0, Validators.min(0)],
      zeroRatedSupplies: [0, Validators.min(0)],
      outputTax:         [0, Validators.min(0)],
      inputTax:          [0, Validators.min(0)],
      taxPaid:           [0, Validators.min(0)],
      submittedBy:       [''],
      remarks:           ['']
    });
  }

  ctrl(name: string) { return this.form.get(name); }

  get isAutoFilled(): boolean { return this.selectedReg !== null; }

  get periodOptions(): string[] {
    return this.ctrl('returnPeriod')?.value === 'Quarterly' ? this.quarters : this.months;
  }

  // Real-time calculations (display only — backend recalculates before save)
  get totalSupplies(): number {
    const v = this.form.value;
    return (v.taxableSupplies || 0) + (v.exemptSupplies || 0) + (v.zeroRatedSupplies || 0);
  }

  get netTaxPayable(): number {
    const v = this.form.value;
    return Math.max(0, (v.outputTax || 0) - (v.inputTax || 0));
  }

  get balanceDue(): number {
    return Math.max(0, this.netTaxPayable - (this.form.value.taxPaid || 0));
  }

  autoCalcOutputTax(): void {
    const taxable = this.ctrl('taxableSupplies')?.value || 0;
    this.form.patchValue({ outputTax: Math.round(taxable * 0.15) });
  }

  // ── VAT Registration Search ───────────────────────────────────────────────

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults   = false;
      this.hasSearched   = false;
    }
  }

  searchVatRegistration(): void {
    const q = this.searchQuery.trim();
    if (!q) { this.toast.warning('Enter a BIN number, TIN or business name to search.'); return; }
    if (q.length < 3) { this.toast.warning('Enter at least 3 characters to search.'); return; }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    this.http.get<VatRegistration[]>(`${API_ENDPOINTS.VAT_REGISTRATIONS.LIST}?search=${encodeURIComponent(q)}`)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        next: (data) => {
          // Only show Active registrations — cannot file a return for Suspended/Cancelled
          this.searchResults = data.filter(r => r.status === 'Active');
          this.showResults   = true;
          this.hasSearched   = true;
          if (this.searchResults.length === 0) {
            this.toast.info('No active VAT registration found. Only Active registrations can file returns.');
          }
        },
        error: () => this.toast.error('Search failed. Please try again.')
      });
  }

  selectRegistration(reg: VatRegistration): void {
    this.selectedReg = reg;
    this.showResults = false;

    this.form.patchValue({ vatRegistrationId: reg.id });
    this.form.get('vatRegistrationId')?.disable();

    this.toast.success(`"${reg.businessName}" selected. Fill in the return details below.`);
  }

  clearSelectedRegistration(): void {
    this.selectedReg  = null;
    this.searchQuery  = '';
    this.searchResults = [];
    this.showResults  = false;
    this.hasSearched  = false;
    this.form.get('vatRegistrationId')?.enable();
    this.form.patchValue({ vatRegistrationId: null });
    this.toast.info('Registration cleared. Search again to select a business.');
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    const payload = this.form.getRawValue(); // getRawValue includes disabled vatRegistrationId

    this.http.post(API_ENDPOINTS.VAT_RETURNS.CREATE, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.toast.success('VAT Return filed successfully!');
          setTimeout(() => this.router.navigate(['/vat-returns']), 1500);
        },
        error: (err) => {
          if (err?.status === 409) {
            this.toast.error(err.error?.message || 'A return for this BIN and period already exists.');
          } else if (err?.status === 400) {
            this.toast.error(err.error?.message || 'Invalid data. Please check all fields.');
          } else {
            this.toast.error('Failed to file VAT return. Please try again.');
          }
        }
      });
  }

  onReset(): void {
    this.clearSelectedRegistration();
    this.form.reset({
      returnPeriod:    'Monthly',
      periodYear:      '2025',
      assessmentYear:  '2025-26',
      submissionDate:  new Date().toISOString().split('T')[0],
      taxableSupplies: 0, exemptSupplies: 0, zeroRatedSupplies: 0,
      outputTax: 0, inputTax: 0, taxPaid: 0
    });
    this.toast.info('Form has been reset.');
  }

  onCancel(): void { this.router.navigate(['/vat-returns']); }
}
