import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  TaxMasterData,
  TaxPreviewResponse,
  TaxSlab,
  TaxStructureCreateRequest,
} from 'src/app/models/tax-structure.model';
import { TaxStructureService } from 'src/app/core/services/tax-strcuture.service';

@Component({
  selector:    'app-tax-structure-create',
  templateUrl: './tax-structure-create.component.html',
  styleUrls:   ['./tax-structure-create.component.css'],
})
export class TaxStructureCreateComponent implements OnInit, OnDestroy {

  private destroy$       = new Subject<void>();
  private previewTrigger = new Subject<void>();

  // ── UI state ──────────────────────────────────────────────────────────────
  isLoading       = false;
  isMasterLoading = true;
  successMsg      = '';
  errorMsg        = '';

  // ── Master data (from API) ────────────────────────────────────────────────
  taxTypes:   string[] = [];
  applicables: string[] = [];
  statuses:   string[] = [];
  rateTypes:  Array<{ value: string; label: string }> = [];

  // ── Preview ───────────────────────────────────────────────────────────────
  previewAmount  = 100000;
  previewResult: TaxPreviewResponse | null = null;
  isPreviewLoading = false;

  // ── Form model ────────────────────────────────────────────────────────────
  form: TaxStructureCreateRequest = {
    taxCode:       '',
    taxName:       '',
    taxType:       'VAT',
    rateType:      'FLAT',
    rate:          15,
    slabs:         [],
    applicableTo:  'All',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate:    '',
    description:   '',
    status:        'Active',
  };

  constructor(
    private router:  Router,
    private service: TaxStructureService,
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadMasterData();
    this.setupPreviewDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Master Data ───────────────────────────────────────────────────────────

  private loadMasterData(): void {
    this.isMasterLoading = true;
    this.service.getMasterData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: TaxMasterData) => {
          this.taxTypes    = data.taxTypes;
          this.applicables  = data.applicables;
          this.statuses    = data.statuses;
          this.rateTypes   = data.rateTypes;
          this.isMasterLoading = false;
          // Trigger first preview with default values
          this.triggerPreview();
        },
        error: () => { this.isMasterLoading = false; },
      });
  }

  // ── Preview (backend) ─────────────────────────────────────────────────────

  private setupPreviewDebounce(): void {
    this.previewTrigger.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(() => {
        if (this.previewAmount <= 0) return of(null);
        this.isPreviewLoading = true;
        return this.service.previewAdHoc({
          amount:   this.previewAmount,
          rateType: this.form.rateType,
          rate:     this.form.rate,
          slabs:    this.form.slabs,
        }).pipe(catchError(() => of(null)));
      }),
      takeUntil(this.destroy$),
    ).subscribe(result => {
      this.previewResult    = result;
      this.isPreviewLoading = false;
    });
  }

  triggerPreview(): void { this.previewTrigger.next(); }

  // ── Slab Management ───────────────────────────────────────────────────────

  onRateTypeChange(): void {
    if (this.form.rateType === 'SLAB' && this.form.slabs.length === 0) {
      this.addDefaultSlabs();
    }
    this.triggerPreview();
  }

  /** Seed the slab table with Bangladesh FY-2024-25 income-tax slabs as a starting point. */
  private addDefaultSlabs(): void {
    this.form.slabs = [
      { minAmount: 0,         maxAmount: 350000,  rate: 0,  label: 'Up to ৳3,50,000',            sortOrder: 0 },
      { minAmount: 350000,    maxAmount: 450000,  rate: 5,  label: '৳3,50,001 – ৳4,50,000',       sortOrder: 1 },
      { minAmount: 450000,    maxAmount: 750000,  rate: 10, label: '৳4,50,001 – ৳7,50,000',       sortOrder: 2 },
      { minAmount: 750000,    maxAmount: 1150000, rate: 15, label: '৳7,50,001 – ৳11,50,000',      sortOrder: 3 },
      { minAmount: 1150000,   maxAmount: 1850000, rate: 20, label: '৳11,50,001 – ৳18,50,000',     sortOrder: 4 },
      { minAmount: 1850000,   maxAmount: null,    rate: 25, label: 'Above ৳18,50,000',             sortOrder: 5 },
    ];
  }

  addSlab(): void {
    const last = this.form.slabs[this.form.slabs.length - 1];
    this.form.slabs.push({
      minAmount:  last ? (last.maxAmount ?? 0) : 0,
      maxAmount:  null,
      rate:       0,
      sortOrder:  this.form.slabs.length,
    });
    this.triggerPreview();
  }

  removeSlab(index: number): void {
    this.form.slabs.splice(index, 1);
    this.form.slabs.forEach((s, i) => (s.sortOrder = i));
    this.triggerPreview();
  }

  trackByIndex = (index: number): number => index;

  // ── Form Submit ───────────────────────────────────────────────────────────

  isFormValid(): boolean {
    const base = !!(this.form.taxCode && this.form.taxName &&
                    this.form.taxType  && this.form.effectiveDate);
    if (!base) return false;
    if (this.form.rateType === 'FLAT')  return this.form.rate > 0;
    if (this.form.rateType === 'SLAB')  return this.form.slabs.length > 0;
    return true;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg  = 'Please fill in all required fields.';
      this.successMsg = '';
      return;
    }

    this.isLoading  = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.service.create(this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading  = false;
          this.successMsg = 'Tax structure created successfully!';
          setTimeout(() => this.router.navigate(['/tax-structure']), 1500);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 409)      this.errorMsg = 'Tax Code or Tax Name already exists.';
          else if (err.status === 400) this.errorMsg = 'Invalid input. Please check the form.';
          else                         this.errorMsg = 'Create failed. Please try again.';
        },
      });
  }

  onReset(): void {
    this.form = {
      taxCode: '', taxName: '', taxType: 'VAT', rateType: 'FLAT',
      rate: 15, slabs: [], applicableTo: 'All',
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '', description: '', status: 'Active',
    };
    this.previewResult = null;
    this.errorMsg = this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/tax-structure']); }
}