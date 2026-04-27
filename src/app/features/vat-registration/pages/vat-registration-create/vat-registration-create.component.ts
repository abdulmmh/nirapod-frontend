import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MasterDataService } from '../../../../core/services/master-data.service';
import {
  BusinessType,
  BusinessCategory,
  Division,
  District,
} from '../../../../models/master-data.model';
import { BusinessVatStatus } from '../../../../models/business.model';
import { VatRegistrationCreateRequest } from '../../../../models/vat-registration.model';

type WizardStep = 1 | 2 | 3;

@Component({
  selector: 'app-vat-registration-create',
  templateUrl: './vat-registration-create.component.html',
  styleUrls: ['./vat-registration-create.component.css'],
})
export class VatRegistrationCreateComponent implements OnInit, OnDestroy {
  // ── Wizard state ──────────────────────────────────────────────────────────
  currentStep: WizardStep = 1;

  // ── Taxpayer (Step 1) ─────────────────────────────────────────────────────
  selectedTaxpayer: Taxpayer | null = null;

  // ── Business (Step 2) ────────────────────────────────────────────────────
  businesses: BusinessVatStatus[] = [];
  selectedBusiness: BusinessVatStatus | null = null;
  loadingBusinesses = false;

  // ── VAT Details form (Step 3) ─────────────────────────────────────────────
  form!: FormGroup;
  isLoading = false;

  // ── Static dropdowns ──────────────────────────────────────────────────────
  readonly vatCategories: string[] = ['Standard', 'Zero Rated', 'Exempt', 'Special'];

  // ── Dynamic master-data dropdowns ─────────────────────────────────────────
  divisions: Division[] = [];
  districts: District[] = [];
  vatZones: any[] = [];
  vatCircles: any[] = [];

  // Loading flags for cascade dropdowns
  loadingDistricts = false;
  loadingZones = false;
  loadingCircles = false;

  
  private pendingDistrictId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private masterData: MasterDataService,
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();
    this.loadStaticDropdowns();
    this.setupCascadeListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group(
      {
        // Resolved IDs — sent to backend
        taxpayerId:        [null],
        businessId:        [null],
        vatZoneId:         [null, Validators.required],
        vatCircleId:       [null, Validators.required],
        districtId:        [null],
        divisionId:        [null],

        // VAT-specific fields the officer must enter
        vatCategory:       ['', Validators.required],
        registrationDate:  [new Date().toISOString().split('T')[0]],
        effectiveDate:     [''],
        expiryDate:        [''],
        remarks:           [''],
      },
      { validators: this.effectiveDateValidator() },
    );
  }


  private effectiveDateValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const reg = group.get('registrationDate')?.value;
      const eff = group.get('effectiveDate')?.value;

      if (reg && eff) {
        const regDate = new Date(reg);
        const effDate = new Date(eff);
        if (effDate < regDate) {
          group.get('effectiveDate')?.setErrors({ beforeRegistration: true });
          return { effectiveDateInvalid: true };
        }
      }
      const effCtrl = group.get('effectiveDate');
      if (effCtrl?.errors?.['beforeRegistration']) {
        const { beforeRegistration, ...rest } = effCtrl.errors;
        effCtrl.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    };
  }

  ctrl(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  // ── Static dropdown loading ────────────────────────────────────────────────

  private loadStaticDropdowns(): void {
    this.masterData
      .getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.divisions = data));
  }

  // ── Cascade: Division → District → Zone → Circle (switchMap) ─────────────

  private setupCascadeListeners(): void {

    // Division → Districts
    this.form
      .get('divisionId')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.districts = [];
          this.vatZones = [];
          this.vatCircles = [];
          // suppress events to avoid re-triggering downstream cascades
          this.form.patchValue(
            { districtId: null, vatZoneId: null, vatCircleId: null },
            { emitEvent: false },
          );
        }),
        filter((id) => !!id),
        switchMap((id) => {
          this.loadingDistricts = true;
          return this.masterData.getDistrictsByDivision(id).pipe(
            catchError(() => of([])),
            finalize(() => (this.loadingDistricts = false)),
          );
        }),
      )
      .subscribe((districts) => {
        this.districts = districts;

        // If selectBusiness() pre-loaded a pending districtId, apply it now.
        if (this.pendingDistrictId !== null) {
          this.form.patchValue({ districtId: this.pendingDistrictId });
          this.pendingDistrictId = null;
        }
      });

    // District → Tax Zones
    this.form
      .get('districtId')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.vatZones = [];
          this.vatCircles = [];
          this.form.patchValue(
            { vatZoneId: null, vatCircleId: null },
            { emitEvent: false },
          );
        }),
        filter((id) => !!id),
        switchMap((id) => {
          this.loadingZones = true;
          return this.masterData.getTaxZonesByDistrict(id).pipe(
            catchError(() => of([])),
            finalize(() => (this.loadingZones = false)),
          );
        }),
      )
      .subscribe((zones) => (this.vatZones = zones));

    // Zone → Circles
    this.form
      .get('vatZoneId')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.vatCircles = [];
          this.form.patchValue({ vatCircleId: null }, { emitEvent: false });
        }),
        filter((id) => !!id),
        switchMap((id) => {
          this.loadingCircles = true;
          return this.masterData.getTaxCirclesByZone(id).pipe(
            catchError(() => of([])),
            finalize(() => (this.loadingCircles = false)),
          );
        }),
      )
      .subscribe((circles) => (this.vatCircles = circles));
  }

  // ── Wizard helpers ────────────────────────────────────────────────────────

  /**
   * Returns true when the selected taxpayer is a Company type.
   * Company taxpayers bypass Step 2 (no business record required).
   */
  get isCompany(): boolean {
    return (
      this.selectedTaxpayer?.taxpayerType?.typeName
        ?.toLowerCase()
        .includes('company') ?? false
    );
  }

  get stepOneComplete(): boolean {
    return this.selectedTaxpayer !== null;
  }

  get stepTwoComplete(): boolean {
    return this.isCompany || this.selectedBusiness !== null;
  }

  get canSubmit(): boolean {
    return this.form.valid && this.stepOneComplete && this.stepTwoComplete;
  }

  // ── Step 1: Taxpayer selection ────────────────────────────────────────────

  onTaxpayerSelected(tp: Taxpayer): void {
    this.selectedTaxpayer = tp;

    // Patch taxpayerId — the only Step 1 data that goes into the form.
    this.form.patchValue({ taxpayerId: tp.id });

    const name = this.getDisplayName(tp);
    this.toast.success(`"${name}" selected.`);

    if (this.isCompany) {
      // Company taxpayers skip Step 2 entirely.
      this.currentStep = 3;
      this.toast.info('Company taxpayer — skipping business selection.');
    } else {
      this.currentStep = 2;
      this.loadBusinesses(tp.id!);
    }
  }

  onTaxpayerCleared(): void {
    this.selectedTaxpayer = null;
    this.selectedBusiness = null;
    this.businesses = [];
    this.currentStep = 1;
    this.form.reset({
      registrationDate: new Date().toISOString().split('T')[0],
    });
    this.districts = [];
    this.vatZones = [];
    this.vatCircles = [];
    this.toast.info('Taxpayer cleared. Starting over.');
  }

  private getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    const type = tp.taxpayerType?.typeName?.toLowerCase() ?? '';
    return type.includes('company')
      ? tp.companyName ?? 'Unknown Company'
      : tp.fullName ?? 'Unknown';
  }

  // ── Step 2: Business selection ────────────────────────────────────────────

  private loadBusinesses(taxpayerId: number): void {
    this.loadingBusinesses = true;
    this.businesses = [];

    this.http
      .get<BusinessVatStatus[]>(
        API_ENDPOINTS.BUSINESSES.BY_TAXPAYER_VAT_STATUS(taxpayerId),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingBusinesses = false)),
      )
      .subscribe({
        next: (data) => {
          this.businesses = data;
          if (data.length === 0) {
            this.toast.warning(
              'No registered businesses for this taxpayer. Please register a business first.',
            );
          }
        },
        // Network errors handled by ErrorInterceptor.
        error: () => {},
      });
  }

  onBusinessSelected(b: BusinessVatStatus): void {
    this.selectedBusiness = b;
    this.form.patchValue({ businessId: b.id });

    // Trigger cascade: set pendingDistrictId so the district-cascade subscriber
    // can auto-select it once districts have loaded for the division.
    if (b.divisionId) {
      this.pendingDistrictId = b.districtId ?? null;
      this.form.patchValue({ divisionId: b.divisionId }); // triggers switchMap
    }

    this.toast.success(
      `"${b.businessName}" selected. Pick the VAT Zone and Circle to continue.`,
    );
    this.currentStep = 3;
  }

  // ── Step navigation ───────────────────────────────────────────────────────

  goBack(): void {
    if (this.currentStep === 3) {
      this.currentStep = this.isCompany ? 1 : 2;
    } else if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  // ── Step 3 helpers (read-only display) ───────────────────────────────────

  /** Display label for the auto-filled business name field. */
  get autoBusinessName(): string {
    if (this.isCompany) {
      return this.selectedTaxpayer?.companyName ?? '';
    }
    return this.selectedBusiness?.businessName ?? '';
  }

  /** Business ID used for the "Request Update" link. */
  get editBusinessId(): number | null {
    return this.selectedBusiness?.id ?? null;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please complete all required fields before submitting.');
      return;
    }

    this.isLoading = true;
    const raw = this.form.getRawValue();

    const payload: VatRegistrationCreateRequest = {
      taxpayerId:       raw.taxpayerId,
      businessId:       raw.businessId ?? null,
      vatZoneId:        raw.vatZoneId,
      vatCircleId:      raw.vatCircleId,
      districtId:       raw.districtId ?? null,
      divisionId:       raw.divisionId ?? null,
      vatCategory:      raw.vatCategory,
      registrationDate: raw.registrationDate,
      effectiveDate:    raw.effectiveDate || undefined,
      expiryDate:       raw.expiryDate    || undefined,
      remarks:          raw.remarks       || undefined,
    };

    this.http
      .post(API_ENDPOINTS.VAT_REGISTRATIONS.CREATE, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('VAT Registration submitted successfully!');
          setTimeout(() => this.router.navigate(['/vat-registration']), 1500);
        },
        // 400/409 are handled globally by ErrorInterceptor.
        // Only catch unexpected errors (5xx, network — also handled by interceptor).
        error: () => {},
      });
  }

  onReset(): void {
    this.selectedTaxpayer = null;
    this.selectedBusiness = null;
    this.businesses = [];
    this.currentStep = 1;
    this.pendingDistrictId = null;
    this.districts = [];
    this.vatZones = [];
    this.vatCircles = [];
    this.form.reset({
      registrationDate: new Date().toISOString().split('T')[0],
    });
    this.toast.info('Form reset.');
  }

  onCancel(): void {
    this.router.navigate(['/vat-registration']);
  }
}
