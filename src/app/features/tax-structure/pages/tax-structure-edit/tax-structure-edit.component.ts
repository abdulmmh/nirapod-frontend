import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { TaxStructureService } from 'src/app/core/services/tax-strcuture.service';

import {
  TaxMasterData,
  TaxPreviewResponse,
  TaxSlab,
  TaxStructure,
  TaxStructureUpdateRequest,
} from 'src/app/models/tax-structure.model';

@Component({
  selector:    'app-tax-structure-edit',
  templateUrl: './tax-structure-edit.component.html',
  styleUrls:   ['./tax-structure-edit.component.css'],
})
export class TaxStructureEditComponent implements OnInit, OnDestroy {

  private destroy$       = new Subject<void>();
  private previewTrigger = new Subject<void>();

  // ── UI state ──────────────────────────────────────────────────────────────
  isLoading       = true;
  isSaving        = false;
  isMasterLoading = true;
  successMsg      = '';
  errorMsg        = '';
  taxId           = 0;

  // ── Master data ───────────────────────────────────────────────────────────
  taxTypes:   string[] = [];
  applicables: string[] = [];
  statuses:   string[] = [];
  rateTypes:  Array<{ value: string; label: string }> = [];

  // ── Preview ───────────────────────────────────────────────────────────────
  previewAmount    = 100000;
  previewResult:   TaxPreviewResponse | null = null;
  isPreviewLoading = false;

  // ── Form model ────────────────────────────────────────────────────────────
  form: TaxStructureUpdateRequest = {
    taxCode: '', taxName: '', taxType: 'VAT', rateType: 'FLAT',
    rate: 0, slabs: [], applicableTo: 'All',
    effectiveDate: '', expiryDate: '', description: '', status: 'Active',
  };

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private service: TaxStructureService,
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.taxId = Number(this.route.snapshot.paramMap.get('id'));
    this.setupPreviewDebounce();
    // Load master data and tax record in parallel
    Promise.all([this.loadMasterData(), this.loadTaxStructure()]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data Loading ──────────────────────────────────────────────────────────

  private loadMasterData(): Promise<void> {
    return new Promise(resolve => {
      this.service.getMasterData()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: TaxMasterData) => {
            this.taxTypes    = data.taxTypes;
            this.applicables  = data.applicables;
            this.statuses    = data.statuses;
            this.rateTypes   = data.rateTypes;
            this.isMasterLoading = false;
            resolve();
          },
          error: () => { this.isMasterLoading = false; resolve(); },
        });
    });
  }

  private loadTaxStructure(): Promise<void> {
    return new Promise(resolve => {
      this.service.getById(this.taxId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: TaxStructure) => {
            // Map entity → update request (strip read-only audit fields)
            this.form = {
              taxCode:       data.taxCode,
              taxName:       data.taxName,
              taxType:       data.taxType,
              rateType:      data.rateType ?? 'FLAT',
              rate:          data.rate ?? 0,
              slabs:         data.slabs ? data.slabs.map(s => ({ ...s })) : [],
              applicableTo:  data.applicableTo,
              effectiveDate: data.effectiveDate,
              expiryDate:    data.expiryDate ?? '',
              description:   data.description ?? '',
              status:        data.status,
            };
            this.isLoading = false;
            this.triggerPreview();
            resolve();
          },
          error: () => {
            this.errorMsg  = 'Failed to load tax structure.';
            this.isLoading = false;
            resolve();
          },
        });
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
        // Use by-id preview once record is saved; ad-hoc preview during editing
        return this.service.previewById(this.taxId, this.previewAmount)
          .pipe(catchError(() =>
            // Fallback to ad-hoc if id preview fails (e.g. slabs not yet committed)
            this.service.previewAdHoc({
              amount:   this.previewAmount,
              rateType: this.form.rateType,
              rate:     this.form.rate,
              slabs:    this.form.slabs,
            }).pipe(catchError(() => of(null)))
          ));
      }),
      takeUntil(this.destroy$),
    ).subscribe(result => {
      this.previewResult    = result;
      this.isPreviewLoading = false;
    });
  }

  triggerPreview(): void { this.previewTrigger.next(); }

  // ── Slab Management ───────────────────────────────────────────────────────

  onRateTypeChange(): void { this.triggerPreview(); }

  addSlab(): void {
    const last = this.form.slabs[this.form.slabs.length - 1];
    this.form.slabs.push({
      minAmount: last ? (last.maxAmount ?? 0) : 0,
      maxAmount: null,
      rate: 0,
      sortOrder: this.form.slabs.length,
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
    if (this.form.rateType === 'FLAT') return this.form.rate > 0;
    if (this.form.rateType === 'SLAB') return this.form.slabs.length > 0;
    return true;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.isSaving   = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.service.update(this.taxId, this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving   = false;
          this.successMsg = 'Tax structure updated successfully!';
          setTimeout(() => this.router.navigate(['/tax-structure/view', this.taxId]), 1500);
        },
        error: (err) => {
          this.isSaving  = false;
          this.errorMsg  = err.error?.message ?? 'Tax structure update failed.';
        },
      });
  }

  onCancel(): void { this.router.navigate(['/tax-structure/view', this.taxId]); }
}