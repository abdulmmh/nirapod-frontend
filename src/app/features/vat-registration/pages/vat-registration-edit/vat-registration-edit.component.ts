import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of, timer } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { VatRegistration } from '../../../../models/vat-registration.model';
import { VatRegistrationService } from '../../services/vat-registration.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MasterDataService } from '../../../../core/services/master-data.service';
import {
  Division,
  District,
  BusinessType,
  BusinessCategory,
  TaxZone,
  TaxCircle
} from '../../../../models/master-data.model';

@Component({
  selector: 'app-vat-registration-edit',
  templateUrl: './vat-registration-edit.component.html',
  styleUrls: ['./vat-registration-edit.component.css'],
})
export class VatRegistrationEditComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isLoading = true;
  isSaving  = false;
  vatId     = 0;
  binNo        = '';
  businessName = '';

  private destroy$ = new Subject<void>();

  // ── Static dropdowns ──────────────────────────────────────────────────────
  readonly vatCategories = ['Standard', 'Zero Rated', 'Exempt', 'Special'];
  readonly statuses      = ['Active', 'Inactive', 'Pending', 'Suspended', 'Cancelled'];

  // ── Dynamic dropdowns ─────────────────────────────────────────────────────
  divisions:          Division[]         = [];
  districts:          District[]         = [];
  businessTypes:      BusinessType[]     = [];
  businessCategories: BusinessCategory[] = [];
  vatZones:           TaxZone[]          = [];
  vatCircles:         TaxCircle[]        = [];

  loadingDistricts = false;
  loadingCircles   = false;

  // ── Cascade-restore pending value ─────────────────────────────────────────
  private pendingDistrictId: number | null = null;

  constructor(
    private fb:         FormBuilder,
    private route:      ActivatedRoute,
    private router:     Router,
    private vatService: VatRegistrationService,
    private toast:      ToastService,
    private masterData: MasterDataService,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.vatId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadStaticDropdowns();
    this.setupCascadeListeners();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      tinNumber:          ['', Validators.required],
      businessName:       ['', Validators.required],
      ownerName:          [''],
      vatCategory:        ['', Validators.required],
      businessTypeId:     [null],
      businessCategoryId: [null],
      tradeLicenseNo:     [''],
      status:             ['Active'],
      divisionId:         [null],
      districtId:         [null],
      vatZoneId:          [null, Validators.required],
      vatCircleId:        [null, Validators.required],
      registrationDate:   [''],
      effectiveDate:      [''],
      expiryDate:         [''],
      annualTurnover:     [0],
      email:              ['', Validators.email],
      phone:              ['', Validators.required],
      address:            [''],
      remarks:            [''],
    });
  }

  ctrl(name: string) { return this.form.get(name); }

  // ── Static dropdowns ───────────────────────────────────────────────────────

  private loadStaticDropdowns(): void {
    this.masterData.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.divisions = data));

    this.masterData.getBusinessTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.businessTypes = data));

    this.masterData.getBusinessCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.businessCategories = data));

    this.masterData.getTaxZones()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.vatZones = data));
  }

  // ── Cascade: Division → District (reactive) ────────────────────────────────

  private setupCascadeListeners(): void {
    this.form.get('divisionId')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.districts = [];
        this.form.patchValue({ districtId: null }, { emitEvent: false });
      }),
      filter(id => !!id),
      switchMap(id => {
        this.loadingDistricts = true;
        return this.masterData.getDistrictsByDivision(id).pipe(
          catchError(() => of([])),
          finalize(() => (this.loadingDistricts = false)),
        );
      }),
    ).subscribe(districts => {
      this.districts = districts;
      if (this.pendingDistrictId !== null) {
        this.form.patchValue({ districtId: this.pendingDistrictId });
        this.pendingDistrictId = null;
      }
    });
  }

  // ── Load existing record ───────────────────────────────────────────────────

  private loadData(): void {
    this.isLoading = true;
    this.vatService.getById(this.vatId)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data: VatRegistration) => {
          this.binNo        = data.binNo;
          this.businessName = data.businessName;

          // Patch non-cascade fields
          this.form.patchValue({
            tinNumber:          data.tinNumber,
            businessName:       data.businessName,
            ownerName:          data.ownerName,
            vatCategory:        data.vatCategory,
            businessTypeId:     (data as any)['businessTypeId']     ?? null,
            businessCategoryId: (data as any)['businessCategoryId'] ?? null,
            tradeLicenseNo:     data.tradeLicenseNo,
            status:             data.status,
            registrationDate:   data.registrationDate,
            effectiveDate:      data.effectiveDate,
            expiryDate:         data.expiryDate,
            annualTurnover:     data.annualTurnover,
            email:              data.email,
            phone:              data.phone,
            address:            data.address,
            remarks:            data.remarks,
          });

          // Restore Zone → Circles directly — zoneId is a typed model field.
          if (data.zoneId) {
            this.form.patchValue({ vatZoneId: data.zoneId }, { emitEvent: false });
            this.loadingCircles = true;
            this.masterData.getTaxCirclesByZone(data.zoneId)
              .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.loadingCircles = false)),
              )
              .subscribe(circles => {
                this.vatCircles = circles;
                const circleId = (data as any)['vatCircleId'] ?? null;
                if (circleId) this.form.patchValue({ vatCircleId: circleId });
              });
          }

          // Restore Division → District via pendingId pattern.
          // Both are @Transient — null in current GET responses.
          // When the backend gap is fixed they will populate automatically.
          const divisionId = (data as any)['divisionId'] ?? null;
          const districtId = (data as any)['districtId'] ?? null;
          if (divisionId) {
            this.pendingDistrictId = districtId;
            this.form.patchValue({ divisionId });
          }
        },
        error: () => {
          this.toast.error('Failed to load VAT registration data.');
          this.router.navigate(['/vat-registration']);
        },
      });
  }

  // ── Zone → Circles (manual — independent of district in edit) ─────────────

  onZoneChange(): void {
    const zoneId = this.ctrl('vatZoneId')?.value;
    this.vatCircles = [];
    this.form.patchValue({ vatCircleId: null });
    if (!zoneId) return;

    this.loadingCircles = true;
    this.masterData.getTaxCirclesByZone(zoneId)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingCircles = false)))
      .subscribe(circles => (this.vatCircles = circles));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;
    this.vatService.update(this.vatId, this.form.value)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toast.success('VAT Registration updated successfully!');
          timer(1500).pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['/vat-registration/view', this.vatId]));
        },
        error: err => {
          if (err?.status === 409) {
            this.toast.error(err.error?.message || 'Conflict: duplicate registration detected.');
          } else if (err?.status === 400) {
            this.toast.error(err.error?.message || 'Invalid data. Please check all fields.');
          } else {
            this.toast.error('Failed to update VAT registration. Please try again.');
          }
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/vat-registration/view', this.vatId]);
  }
}
