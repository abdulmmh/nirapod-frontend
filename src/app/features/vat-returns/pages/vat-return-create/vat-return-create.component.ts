import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistration } from '../../../../models/vat-registration.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { FiscalYear } from '../../../../models/fiscal-year.model';

// ── VAT-rate map ───────────────────────────────────────────────────────────────
const VAT_RATES: Record<string, number> = {
  Standard: 0.15,
  'Zero Rated': 0.0,
  Exempt: 0.0,
  Special: 0.05,
};

// ── Return-period enum alignment ───────────────────────────────────────────────
export type ReturnPeriod = 'Monthly' | 'Quarterly' | 'Annually';

function submissionNotBeforePeriodValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const form = group as FormGroup;
    const submissionDate: string = form.get('submissionDate')?.value;
    const periodMonth: string = form.get('periodMonth')?.value;
    const periodYear: string = form.get('periodYear')?.value;
    const returnPeriod: ReturnPeriod = form.get('returnPeriod')?.value;

    if (!submissionDate || !periodMonth || !periodYear) return null;

    let periodStart: Date;

    if (returnPeriod === 'Quarterly') {
      const quarterMap: Record<string, number> = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 };
      const month = quarterMap[periodMonth] ?? 0;
      periodStart = new Date(Number(periodYear), month, 1);
    } else {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const monthIdx = monthNames.indexOf(periodMonth);
      const month = monthIdx >= 0 ? monthIdx : 0;
      periodStart = new Date(Number(periodYear), month, 1);
    }

    const submission = new Date(submissionDate);

    if (submission < periodStart) {
      return { submissionBeforePeriod: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-vat-return-create',
  templateUrl: './vat-return-create.component.html',
  styleUrls: ['./vat-return-create.component.css'],
})
export class VatReturnCreateComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading = false;

  // ── Selected registration (received from picker child) ────────────────────
  selectedReg: VatRegistration | null = null;

  // ── Dropdown data ─────────────────────────────────────────────────────────
  readonly returnPeriods: ReturnPeriod[] = ['Monthly', 'Quarterly', 'Annually'];
  readonly months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  readonly quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  readonly years = ['2025', '2024', '2023', '2022', '2021'];
  assessmentYears: FiscalYear[] = [];
  readonly submitters = [
    'Taxpayer',
    'Tax Officer',
    'Data Entry Operator',
    'Tax Commissioner',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadFiscalYears();
    this.wireValueChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form construction ─────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group(
      {
        vatRegistrationId: [null, Validators.required],
        returnPeriod: ['Monthly', Validators.required],
        periodMonth: ['', Validators.required],
        periodYear: ['2025', Validators.required],
        assessmentYear: [''],
        submissionDate: [new Date().toISOString().split('T')[0]],
        dueDate: [''],
        taxableSupplies: [0, Validators.min(0)],
        exemptSupplies: [0, Validators.min(0)],
        zeroRatedSupplies: [0, Validators.min(0)],
        outputTax: [{ value: 0, disabled: true }],
        inputTax: [0, Validators.min(0)],
        taxPaid: [0, Validators.min(0)],
        submittedBy: [''],
        remarks: [''],
      },
      { validators: submissionNotBeforePeriodValidator() },
    );
  }

  private wireValueChanges(): void {
    this.form
      .get('taxableSupplies')!
      .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((taxable: number) => this.recalcOutputTax(taxable ?? 0));

    this.form
      .get('returnPeriod')!
      .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() =>
        this.form.patchValue({ periodMonth: '' }, { emitEvent: false }),
      );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  ctrl(name: string) {
    return this.form.get(name);
  }

  get periodOptions(): string[] {
    return this.ctrl('returnPeriod')?.value === 'Quarterly'
      ? this.quarters
      : this.months;
  }

  // ── Computed display values ──

  get totalSupplies(): number {
    const v = this.form.getRawValue();
    return (
      (v.taxableSupplies || 0) +
      (v.exemptSupplies || 0) +
      (v.zeroRatedSupplies || 0)
    );
  }

  get netTaxPayable(): number {
    const v = this.form.getRawValue();
    return Math.max(0, (v.outputTax || 0) - (v.inputTax || 0));
  }

  get balanceDue(): number {
    return Math.max(
      0,
      this.netTaxPayable - (this.form.getRawValue().taxPaid || 0),
    );
  }

  get effectiveVatRate(): number {
    return this.selectedReg
      ? (VAT_RATES[this.selectedReg.vatCategory] ?? 0.15)
      : 0.15;
  }

  get effectiveVatRateLabel(): string {
    return `${(this.effectiveVatRate * 100).toFixed(0)}%`;
  }

  private recalcOutputTax(taxable: number): void {
    const computed = Math.round(taxable * this.effectiveVatRate);
    this.form.get('outputTax')!.setValue(computed, { emitEvent: false });
  }

  private loadFiscalYears(): void {
    this.http
      .get<FiscalYear[]>(API_ENDPOINTS.FISCAL_YEARS.LIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (years) => {
          this.assessmentYears = years.sort((a, b) =>
            b.yearName.localeCompare(a.yearName),
          );
          if (this.assessmentYears.length > 0) {
            this.form.patchValue({
              assessmentYear: this.assessmentYears[0].yearName,
            });
          }
        },
        error: () => {
          this.assessmentYears = [];
          this.toast.warning(
            'Could not load fiscal year list. Please try again later.',
          );
        },
      });
  }

  // ── Picker child events ───────────────────────────────────────────────────

  onRegistrationSelected(reg: VatRegistration): void {
    this.selectedReg = reg;
    this.form.patchValue({ vatRegistrationId: reg.id });
    this.form.get('vatRegistrationId')!.disable();

    this.recalcOutputTax(this.form.get('taxableSupplies')!.value ?? 0);
  }

  onRegistrationCleared(): void {
    this.selectedReg = null;
    this.form.get('vatRegistrationId')!.enable();
    this.form.patchValue({ vatRegistrationId: null, outputTax: 0 });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      if (this.form.errors?.['submissionBeforePeriod']) {
        this.toast.warning(
          'Submission date cannot be earlier than the start of the filing period.',
        );
      } else {
        this.toast.warning('Please fill in all required fields.');
      }
      return;
    }

    this.isLoading = true;
    const payload = this.form.getRawValue();

    this.http
      .post(API_ENDPOINTS.VAT_RETURNS.CREATE, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('VAT Return filed successfully!');
          timer(1500)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() =>
              this.router.navigate(['..'], { relativeTo: this.route }),
            );
        },
        error: (err) => {
          if (err?.status === 400) {
            this.toast.error(
              err.error?.message || 'Invalid data. Please check all fields.',
            );
          }
        },
      });
  }

  // ── Reset / Cancel ────────────────────────────────────────────────────────

  onReset(): void {
    this.selectedReg = null;
    this.form.get('vatRegistrationId')!.enable();
    this.form.reset({
      returnPeriod: 'Monthly',
      periodYear: '2025',
      assessmentYear: '2025-26',
      submissionDate: new Date().toISOString().split('T')[0],
      taxableSupplies: 0,
      exemptSupplies: 0,
      zeroRatedSupplies: 0,
      outputTax: 0,
      inputTax: 0,
      taxPaid: 0,
    });
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['..'], {
        relativeTo: this.route,
      });
    }
  }
}
