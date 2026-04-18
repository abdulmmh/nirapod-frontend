import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { BaseApiService }   from '../../../../core/services/base-api.service';
import { ToastService }     from '../../../../shared/toast/toast.service';
import { API_ENDPOINTS }    from '../../../../core/constants/api.constants';
import { IT10B, IT10BRequest } from '../../../../models/it10b.model';

@Component({
  selector: 'app-it10b',
  templateUrl: './it10b.component.html',
  styleUrls:   ['./it10b.component.css']
})
export class It10bComponent implements OnInit, OnDestroy {

  form!: FormGroup;

  returnId    = 0;     
  returnNo    = '';    
  existingId  = 0;    
  isLoading   = false;
  isSaving    = false;
  netWealth   = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb:      FormBuilder,
    private route:   ActivatedRoute,
    private router:  Router,
    private api:     BaseApiService,
    private toast:   ToastService
  ) {}

  ngOnInit(): void {
    this.returnId = Number(this.route.snapshot.paramMap.get('returnId'));
    this.returnNo = this.route.snapshot.queryParamMap.get('returnNo') || '';

    if (!this.returnId) {
      this.toast.error('Invalid Return ID. Please go back and try again.');
      this.router.navigate(['/income-tax-returns']);
      return;
    }

    this.buildForm();
    this.listenToValueChanges();
    this.tryLoadExisting();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form Builder ──────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      nonAgriculturalProperty: [0, [Validators.required, Validators.min(0)]],
      agriculturalProperty:    [0, [Validators.required, Validators.min(0)]],
      investments:             [0, [Validators.required, Validators.min(0)]],
      motorVehicles:           [0, [Validators.required, Validators.min(0)]],
      bankBalances:            [0, [Validators.required, Validators.min(0)]],
      personalLiabilities:     [0, [Validators.required, Validators.min(0)]]
    });
  }

  // ── Real-time netWealth via valueChanges ──────────────────────────────────

  private listenToValueChanges(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => {
        const totalAssets =
          (v.nonAgriculturalProperty || 0) +
          (v.agriculturalProperty    || 0) +
          (v.investments             || 0) +
          (v.motorVehicles           || 0) +
          (v.bankBalances            || 0);

        this.netWealth = totalAssets - (v.personalLiabilities || 0);
      });
  }

  // ── Load existing IT-10B (edit mode) ─────────────────────────────────────

  private tryLoadExisting(): void {
    this.isLoading = true;
    const url = API_ENDPOINTS.IT10B.BY_RETURN(this.returnId);

    this.api.get<IT10B>(url)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          // Edit mode — patch form with existing values
          this.existingId = data.id;
          this.form.patchValue({
            nonAgriculturalProperty: data.nonAgriculturalProperty,
            agriculturalProperty:    data.agriculturalProperty,
            investments:             data.investments,
            motorVehicles:           data.motorVehicles,
            bankBalances:            data.bankBalances,
            personalLiabilities:     data.personalLiabilities
          });
         
        },
        error: (err) => {
          if (err?.status === 404 || err?.message?.includes('404')) {
          } else {
            this.toast.error('Failed to load existing IT-10B statement.');
          }
          this.isLoading = false;
        }
      });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fix the highlighted errors before submitting.');
      return;
    }

    const payload: IT10BRequest = {
      returnId: this.returnId,
      ...this.form.value
    };

    this.isSaving = true;

    if (this.existingId > 0) {
      // Update mode
      const url = API_ENDPOINTS.IT10B.UPDATE(this.existingId);
      this.api['put']<IT10B>(url, payload)
        .pipe(takeUntil(this.destroy$), finalize(() => (this.isSaving = false)))
        .subscribe({
          next: () => {
            this.toast.success('IT-10B Statement updated successfully!');
            setTimeout(() => this.goBack(), 1500);
          },
          error: (err) => this.handleSaveError(err)
        });
    } else {
      // Create mode
      this.api['post']<IT10B>(API_ENDPOINTS.IT10B.CREATE, payload)
        .pipe(takeUntil(this.destroy$), finalize(() => (this.isSaving = false)))
        .subscribe({
          next: (data) => {
            this.existingId = data.id;   
            this.toast.success('IT-10B Statement filed successfully!');
            setTimeout(() => this.goBack(), 1500);
          },
          error: (err) => this.handleSaveError(err)
        });
    }
  }

  private handleSaveError(err: any): void {
    if (err?.status === 409 || err?.message?.includes('409')) {
      this.toast.error('An IT-10B statement already exists for this return.');
    } else if (err?.status === 400 || err?.message?.includes('400')) {
      this.toast.error('Invalid data. Please check all fields and try again.');
    } else {
      this.toast.error('Failed to save IT-10B statement. Please try again.');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  onReset(): void {
    this.form.reset({
      nonAgriculturalProperty: 0,
      agriculturalProperty:    0,
      investments:             0,
      motorVehicles:           0,
      bankBalances:            0,
      personalLiabilities:     0
    });
    this.toast.info('Form has been reset.');
  }

  goBack(): void {
    this.router.navigate(['/income-tax-returns/view', this.returnId]);
  }

  get isEditMode(): boolean { return this.existingId > 0; }

  get totalAssets(): number {
    const v = this.form.value;
    return (v.nonAgriculturalProperty || 0) +
           (v.agriculturalProperty    || 0) +
           (v.investments             || 0) +
           (v.motorVehicles           || 0) +
           (v.bankBalances            || 0);
  }

  ctrl(name: string) { return this.form.get(name); }

  fmt(val: number): string {
    return '৳' + (val || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
