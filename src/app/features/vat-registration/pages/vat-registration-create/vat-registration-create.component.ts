import {
  Component, OnDestroy, OnInit,
} from '@angular/core';
import {
  AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import {
  catchError, debounceTime, filter, finalize, switchMap, takeUntil, tap,
} from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MasterDataService } from '../../../../core/services/master-data.service';
import { Division, District } from '../../../../models/master-data.model';
import { BusinessVatStatus } from '../../../../models/business.model';
import {
  VatRegistration, VatRegistrationCreateRequest,
} from '../../../../models/vat-registration.model';
import { VatRegistrationService } from '../../services/vat-registration.service';

type WizardStep = 1 | 2 | 3;

interface VatRegDraft {
  savedAt: string;
  currentStep: WizardStep;
  selectedTaxpayer: Taxpayer;
  businesses: BusinessVatStatus[];
  selectedBusiness: BusinessVatStatus | null;
  formValues: Record<string, any>;
}

@Component({
  selector: 'app-vat-registration-create',
  templateUrl: './vat-registration-create.component.html',
  styleUrls: ['./vat-registration-create.component.css'],
})
export class VatRegistrationCreateComponent implements OnInit, OnDestroy {

  currentStep: WizardStep = 1;
  selectedTaxpayer: Taxpayer | null = null;
  businesses: BusinessVatStatus[] = [];
  selectedBusiness: BusinessVatStatus | null = null;
  loadingBusinesses = false;
  form!: FormGroup;
  isLoading = false;

  readonly vatCategories: string[] = ['Standard', 'Zero Rated', 'Exempt', 'Special'];

  divisions: Division[] = [];
  districts: District[] = [];
  vatZones: any[] = [];
  vatCircles: any[] = [];

  loadingDistricts = false;
  loadingZones = false;
  loadingCircles = false;

  private pendingDistrictId: number | null = null;
  private pendingVatZoneId: number | null = null;
  private pendingVatCircleId: number | null = null;

  private readonly DRAFT_KEY = 'nvtms_vat_reg_draft';
  showDraftBanner = false;
  private _pendingDraft: VatRegDraft | null = null;

  showReviewModal = false;
  declarationAccepted = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private masterData: MasterDataService,
    private vatService: VatRegistrationService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadStaticDropdowns();
    this.setupCascadeListeners();
    this.setupDraftAutoSave();
    this.restoreDraft();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group(
      {
        taxpayerId: [null],
        businessId: [null],
        vatZoneId: [null, Validators.required],
        vatCircleId: [null, Validators.required],
        districtId: [null],
        divisionId: [null],
        vatCategory: ['', Validators.required],
        registrationDate: [new Date().toISOString().split('T')[0]],
        effectiveDate: [''],
        expiryDate: [''],
        remarks: [''],
      },
      { validators: this.effectiveDateValidator() },
    );
  }

  private effectiveDateValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const reg = group.get('registrationDate')?.value;
      const eff = group.get('effectiveDate')?.value;
      if (reg && eff && new Date(eff) < new Date(reg)) {
        group.get('effectiveDate')?.setErrors({ beforeRegistration: true });
        return { effectiveDateInvalid: true };
      }
      const effCtrl = group.get('effectiveDate');
      if (effCtrl?.errors?.['beforeRegistration']) {
        const { beforeRegistration, ...rest } = effCtrl.errors;
        effCtrl.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    };
  }

  ctrl(name: string): AbstractControl | null { return this.form.get(name); }

  private loadStaticDropdowns(): void {
    this.masterData.getDivisions().pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.divisions = data));
  }

  private setupCascadeListeners(): void {
    this.form.get('divisionId')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.districts = []; this.vatZones = []; this.vatCircles = [];
        this.form.patchValue(
          { districtId: null, vatZoneId: null, vatCircleId: null },
          { emitEvent: false },
        );
      }),
      filter(id => !!id),
      switchMap(id => {
        this.loadingDistricts = true;
        return this.masterData.getDistrictsByDivision(id).pipe(
          catchError(() => of([])), finalize(() => (this.loadingDistricts = false)),
        );
      }),
    ).subscribe(districts => {
      this.districts = districts;
      if (this.pendingDistrictId !== null) {
        this.form.patchValue({ districtId: this.pendingDistrictId });
        this.pendingDistrictId = null;
      }
    });

    this.form.get('districtId')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.vatZones = []; this.vatCircles = [];
        this.form.patchValue({ vatZoneId: null, vatCircleId: null }, { emitEvent: false });
      }),
      filter(id => !!id),
      switchMap(id => {
        this.loadingZones = true;
        return this.masterData.getTaxZonesByDistrict(id).pipe(
          catchError(() => of([])), finalize(() => (this.loadingZones = false)),
        );
      }),
    ).subscribe(zones => {
      this.vatZones = zones;
      if (this.pendingVatZoneId !== null) {
        this.form.patchValue({ vatZoneId: this.pendingVatZoneId });
        this.pendingVatZoneId = null;
      }
    });

    this.form.get('vatZoneId')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.vatCircles = [];
        this.form.patchValue({ vatCircleId: null }, { emitEvent: false });
      }),
      filter(id => !!id),
      switchMap(id => {
        this.loadingCircles = true;
        return this.masterData.getTaxCirclesByZone(id).pipe(
          catchError(() => of([])), finalize(() => (this.loadingCircles = false)),
        );
      }),
    ).subscribe(circles => {
      this.vatCircles = circles;
      if (this.pendingVatCircleId !== null) {
        this.form.patchValue({ vatCircleId: this.pendingVatCircleId });
        this.pendingVatCircleId = null;
      }
    });
  }

  private setupDraftAutoSave(): void {
    this.form.valueChanges.pipe(debounceTime(800), takeUntil(this.destroy$))
      .subscribe(() => this.saveDraft());
  }

  private saveDraft(): void {
    if (!this.selectedTaxpayer) return;
    const draft: VatRegDraft = {
      savedAt: new Date().toISOString(), currentStep: this.currentStep,
      selectedTaxpayer: this.selectedTaxpayer, businesses: this.businesses,
      selectedBusiness: this.selectedBusiness, formValues: this.form.getRawValue(),
    };
    try { localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft)); } catch { }
  }

  private restoreDraft(): void {
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) return;
      const draft: VatRegDraft = JSON.parse(raw);
      if (!draft?.selectedTaxpayer) { this.clearDraft(); return; }
      this._pendingDraft = draft;
      this.showDraftBanner = true;
    } catch { this.clearDraft(); }
  }

  private applyDraft(draft: VatRegDraft): void {
    this.selectedTaxpayer = draft.selectedTaxpayer;
    this.businesses = draft.businesses ?? [];
    this.selectedBusiness = draft.selectedBusiness;
    this.currentStep = draft.currentStep ?? 1;
    const fv = draft.formValues;
    this.form.patchValue({
      taxpayerId: fv['taxpayerId'], businessId: fv['businessId'],
      vatCategory: fv['vatCategory'], registrationDate: fv['registrationDate'],
      effectiveDate: fv['effectiveDate'], expiryDate: fv['expiryDate'],
      remarks: fv['remarks'],
    }, { emitEvent: false });
    if (fv['divisionId']) {
      this.pendingDistrictId  = fv['districtId']  ?? null;
      this.pendingVatZoneId   = fv['vatZoneId']   ?? null;
      this.pendingVatCircleId = fv['vatCircleId'] ?? null;
      this.form.patchValue({ divisionId: fv['divisionId'] });
    }
  }

  dismissDraft(): void {
    if (this._pendingDraft) { this.applyDraft(this._pendingDraft); this.toast.info('Draft restored.'); }
    this._pendingDraft = null; this.showDraftBanner = false;
  }

  discardDraft(): void {
    this._pendingDraft = null; this.showDraftBanner = false;
    this.clearDraft(); this.toast.info('Draft discarded. Starting fresh.');
  }

  private clearDraft(): void { try { localStorage.removeItem(this.DRAFT_KEY); } catch { } }

  get draftSavedAt(): string {
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) return '';
      const draft: VatRegDraft = JSON.parse(raw);
      if (!draft.savedAt) return '';
      const diffMins = Math.floor((Date.now() - new Date(draft.savedAt).getTime()) / 60_000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
      return new Date(draft.savedAt).toLocaleDateString();
    } catch { return ''; }
  }

  get isCompany(): boolean {
    return this.selectedTaxpayer?.taxpayerType?.typeName?.toLowerCase().includes('company') ?? false;
  }

  get stepOneComplete(): boolean { return this.selectedTaxpayer !== null; }
  get stepTwoComplete(): boolean { return this.isCompany || this.selectedBusiness !== null; }
  get canSubmit(): boolean { return this.form.valid && this.stepOneComplete && this.stepTwoComplete; }
  get displayName(): string { return this.getTaxpayerDisplayName(this.selectedTaxpayer); }

  private getTaxpayerDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    return tp.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? (tp.companyName ?? 'Unknown Company') : (tp.fullName ?? 'Unknown');
  }

  onTaxpayerSelected(tp: Taxpayer): void {
    this.selectedTaxpayer = tp;
    this.form.patchValue({ taxpayerId: tp.id });
    this.toast.success(`"${this.getTaxpayerDisplayName(tp)}" selected.`);
    if (this.isCompany) { this.currentStep = 3; this.toast.info('Company taxpayer — skipping business selection.'); }
    else { this.currentStep = 2; this.loadBusinesses(tp.id!); }
    this.saveDraft();
  }

  onTaxpayerCleared(): void {
    this.selectedTaxpayer = null; this.selectedBusiness = null; this.businesses = [];
    this.currentStep = 1; this.districts = []; this.vatZones = []; this.vatCircles = [];
    this.form.reset({ registrationDate: new Date().toISOString().split('T')[0] });
    this.clearDraft(); this.toast.info('Taxpayer cleared. Starting over.');
  }

  private loadBusinesses(taxpayerId: number): void {
    // TODO Phase 6: migrate to BusinessService with mock fallback
    this.loadingBusinesses = true; this.businesses = [];
    this.http.get<BusinessVatStatus[]>(API_ENDPOINTS.BUSINESSES.BY_TAXPAYER_VAT_STATUS(taxpayerId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingBusinesses = false)))
      .subscribe({
        next: data => { this.businesses = data; if (!data.length) this.toast.warning('No registered businesses for this taxpayer.'); },
        error: () => {},
      });
  }

  onBusinessSelected(b: BusinessVatStatus): void {
    this.selectedBusiness = b; this.form.patchValue({ businessId: b.id });
    if (b.divisionId) { this.pendingDistrictId = b.districtId ?? null; this.form.patchValue({ divisionId: b.divisionId }); }
    this.toast.success(`"${b.businessName}" selected. Pick the VAT Zone and Circle to continue.`);
    this.currentStep = 3; this.saveDraft();
  }

  goBack(): void {
    if (this.currentStep === 3) this.currentStep = this.isCompany ? 1 : 2;
    else if (this.currentStep === 2) this.currentStep = 1;
  }

  get autoBusinessName(): string {
    return this.isCompany ? (this.selectedTaxpayer?.companyName ?? '') : (this.selectedBusiness?.businessName ?? '');
  }
  get editBusinessId(): number | null { return this.selectedBusiness?.id ?? null; }

  get reviewZoneName(): string     { const id = this.ctrl('vatZoneId')?.value;   return this.vatZones.find(z => z.id == id)?.name   ?? '—'; }
  get reviewCircleName(): string   { const id = this.ctrl('vatCircleId')?.value;  return this.vatCircles.find(c => c.id == id)?.name ?? '—'; }
  get reviewDistrictName(): string { const id = this.ctrl('districtId')?.value;  return this.districts.find(d => d.id == id)?.name  ?? '—'; }
  get reviewDivisionName(): string { const id = this.ctrl('divisionId')?.value;  return this.divisions.find(d => d.id == id)?.name  ?? '—'; }

  onOpenReview(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.toast.warning('Please complete all required fields.'); return; }
    if (!this.canSubmit) return;
    this.declarationAccepted = false; this.showReviewModal = true;
  }
  onCloseReview(): void { this.showReviewModal = false; }

  onConfirmSubmit(): void {
    if (!this.declarationAccepted || this.isLoading) return;
    this.showReviewModal = false; this.isLoading = true;
    const raw = this.form.getRawValue();
    const payload: VatRegistrationCreateRequest = {
      taxpayerId: raw['taxpayerId'], businessId: raw['businessId'] ?? null,
      vatZoneId: raw['vatZoneId'], vatCircleId: raw['vatCircleId'],
      districtId: raw['districtId'] ?? null, divisionId: raw['divisionId'] ?? null,
      vatCategory: raw['vatCategory'], registrationDate: raw['registrationDate'],
      effectiveDate: raw['effectiveDate'] || undefined,
      expiryDate: raw['expiryDate'] || undefined,
      remarks: raw['remarks'] || undefined,
    };
    this.vatService.create(payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (created: VatRegistration) => {
          this.clearDraft();
          this.router.navigate(['/vat-registration/success'], { state: { registration: created } });
        },
        error: () => {},
      });
  }

  onReset(): void {
    this.selectedTaxpayer = null; this.selectedBusiness = null; this.businesses = [];
    this.currentStep = 1; this.pendingDistrictId = null; this.pendingVatZoneId = null;
    this.pendingVatCircleId = null; this.districts = []; this.vatZones = []; this.vatCircles = [];
    this.showReviewModal = false; this.declarationAccepted = false;
    this.form.reset({ registrationDate: new Date().toISOString().split('T')[0] });
    this.clearDraft(); this.toast.info('Form reset.');
  }

  onCancel(): void { this.router.navigate(['/vat-registration']); }
}