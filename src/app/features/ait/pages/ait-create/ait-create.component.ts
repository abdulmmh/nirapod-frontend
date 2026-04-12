import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import {
  AitCreateRequest,
  AitSourceType,
  AitStatus,
} from '../../../../models/ait.model';

import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Taxpayer } from 'src/app/models/taxpayer.model';
import { TaxStructure } from 'src/app/models/tax-structure.model';

@Component({
  selector: 'app-ait-create',
  templateUrl: './ait-create.component.html',
  styleUrls: ['./ait-create.component.css'],
})
export class AitCreateComponent implements OnInit, OnDestroy {
  // ──────────────── State ────────────────
  isLoading = false;

  form: AitCreateRequest = this.getEmptyForm();
  private destroy$ = new Subject<void>();

  // ──────────────── Dropdown Data ────────────────
  taxpayers: Partial<Taxpayer>[] = [];
  availableStructures: Partial<TaxStructure>[] = [];

  sourceTypes: AitSourceType[] = [
    'Salary',
    'Import',
    'Contract',
    'Interest',
    'Dividend',
    'Commission',
    'Export',
  ];

  statuses: AitStatus[] = [
    'Draft',
    'Deducted',
    'Deposited',
    'Credited',
    'Disputed',
  ];

  fiscalYears: string[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  // ──────────────── Lifecycle ────────────────
  ngOnInit(): void {
    this.fiscalYears = this.generateFiscalYears();
    this.form.fiscalYear = this.fiscalYears[0];

    this.loadTaxpayers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────── API Calls ────────────────

  private loadTaxpayers(): void {
    this.http
      .get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.taxpayers = res),
        error: () => this.toast.error('Failed to load taxpayers'),
      });
  }

  private loadStructuresBySource(source: AitSourceType): void {
    if (!source) return;

    this.http
      .get<TaxStructure[]>(API_ENDPOINTS.TAX_STRUCTURES.BY_SOURCE(source))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.availableStructures = res),
        error: () => this.toast.error('Failed to load tax structures'),
      });
  }

  // ──────────────── Events ────────────────

  onTaxpayerChange(): void {
    const tp = this.taxpayers.find((t) => t.tinNumber === this.form.tinNumber);
    if (tp) this.form.taxpayerName = tp.fullName!;
  }

  onSourceChange(): void {
    this.resetStructureFields();
    this.loadStructuresBySource(this.form.sourceType as AitSourceType);
  }

  onStructureChange(): void {
    const structure = this.availableStructures.find(
      (s) => s.id === Number(this.form.taxStructureId),
    );

    if (structure) {
      this.form.aitRate = structure.rate!;
    }
  }

  private resetStructureFields(): void {
    this.availableStructures = [];
    this.form.taxStructureId = 0;
    this.form.aitRate = 0;
  }

  // ──────────────── Computed ────────────────

  get aitAmount(): number {
    const { grossAmount, aitRate } = this.form;
    return grossAmount && aitRate
      ? Math.round((grossAmount * aitRate) / 100)
      : 0;
  }

  // ──────────────── Helpers ────────────────

  private generateFiscalYears(): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];

    for (let i = 0; i < 5; i++) {
      const start = currentYear - i;
      const end = (start + 1).toString().slice(-2);
      years.push(`${start}-${end}`);
    }

    return years;
  }

  private getEmptyForm(): AitCreateRequest {
    return {
      tinNumber: '',
      taxpayerName: '',
      sourceType: '' as AitSourceType,
      taxStructureId: 0,
      grossAmount: 0,
      aitRate: 0,
      deductionDate: new Date().toISOString().split('T')[0],
      fiscalYear: '',
      deductedBy: '',
      status: 'Draft' as AitStatus,
      remarks: '',
    };
  }

  // ──────────────── Validation ────────────────

  isFormValid(): boolean {
    const f = this.form;

    return !!(
      f.tinNumber &&
      f.taxpayerName &&
      f.sourceType &&
      f.taxStructureId &&
      f.grossAmount > 0 &&
      f.deductedBy &&
      f.deductionDate &&
      f.fiscalYear &&
      f.status
    );
  }

  // ──────────────── Actions ────────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;

    this.http
      .post(API_ENDPOINTS.AITS.CREATE, this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
  }

  private handleSuccess(): void {
    this.toast.success('AIT record created successfully!');
    this.onReset();
  }

  private handleError(error: unknown): void {
    console.error(error);
    this.toast.error('Failed to create AIT record.');
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.form.fiscalYear = this.fiscalYears[0];
    this.availableStructures = [];
  }

  onCancel(): void {
    this.router.navigate(['/ait']);
  }
}
