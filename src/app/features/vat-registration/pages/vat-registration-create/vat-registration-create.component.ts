import {
  Component, OnDestroy, OnInit,
} from '@angular/core';
import {
  AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import {
  catchError, debounceTime, filter, finalize, switchMap, takeUntil, tap,
} from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MasterDataService } from '../../../../core/services/master-data.service';
import { Division, District, TaxCircle, TaxZone } from '../../../../models/master-data.model';
import { BusinessVatStatus } from '../../../../models/business.model';
import {
  VatRegistration,
  VatRegistrationCreateRequest,
} from '../../../../models/vat-registration.model';
import { VatRegistrationService } from '../../services/vat-registration.service';

type WizardStep = 1 | 2 | 3;
type DocKey = 'tradeLicense' | 'tinCertificate' | 'nidAuthorized';

interface VatRegDraft {
  savedAt:          string;
  currentStep:      WizardStep;
  selectedTaxpayer: Taxpayer;
  businesses:       BusinessVatStatus[];
  selectedBusiness: BusinessVatStatus | null;
  formValues:       Record<string, any>;
}

@Component({
  selector: 'app-vat-registration-create',
  templateUrl: './vat-registration-create.component.html',
  styleUrls: ['./vat-registration-create.component.css'],
})
export class VatRegistrationCreateComponent implements OnInit, OnDestroy {

  // ── Wizard ─────────────────────────────────────────────────────────────────
  currentStep: WizardStep = 1;

  // ── Taxpayer (Step 1) ──────────────────────────────────────────────────────
  selectedTaxpayer: Taxpayer | null = null;

  // ── Business (Step 2) ─────────────────────────────────────────────────────
  businesses:       BusinessVatStatus[] = [];
  selectedBusiness: BusinessVatStatus | null = null;
  loadingBusinesses = false;

  // ── Form (Step 3) ─────────────────────────────────────────────────────────
  form!: FormGroup;
  isLoading = false;

  // ── VAT category radio options ────────────────────────────────────────────
  readonly vatCategoryOptions: { value: string; label: string }[] = [
    { value: 'Standard',   label: 'Standard rate (15%)' },
    { value: 'Zero Rated', label: 'Zero-rated / Exempt'  },
    { value: 'Exempt',     label: 'Exempt'               },
    { value: 'Special',    label: 'Reduced rate'         },
  ];

  // ── Document upload state ─────────────────────────────────────────────────
  /**
   * File objects live in component memory only — they cannot be serialised
   * to localStorage. Officers must re-attach files after a page refresh.
   * This is standard behaviour for government document portals.
   * Actual multipart upload to the backend is deferred to Phase 6.
   */
  uploadedFiles: Record<DocKey, File | null> = {
    tradeLicense:   null,
    tinCertificate: null,
    nidAuthorized:  null,
  };

  readonly documentFields: { key: DocKey; label: string; hint: string }[] = [
    { key: 'tradeLicense',   label: 'Trade License',           hint: 'PDF or image — max 5 MB' },
    { key: 'tinCertificate', label: 'TIN Certificate',         hint: 'PDF or image — max 5 MB' },
    { key: 'nidAuthorized',  label: 'NID (Authorized Person)', hint: 'PDF or image — max 5 MB' },
  ];

  private readonly MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

  // ── Dynamic master-data ───────────────────────────────────────────────────
  divisions:  Division[] = [];
  districts:  District[] = [];
  vatZones:   TaxZone[]   = [];
  vatCircles: TaxCircle[] = [];

  loadingDistricts = false;
  loadingZones     = false;
  loadingCircles   = false;

  // ── Cascade-restore pending values ────────────────────────────────────────
  private pendingDistrictId:  number | null = null;
  private pendingVatZoneId:   number | null = null;
  private pendingVatCircleId: number | null = null;

  // ── Draft ─────────────────────────────────────────────────────────────────
  private readonly DRAFT_KEY = 'nvtms_vat_reg_draft';
  showDraftBanner = false;
  private _pendingDraft: VatRegDraft | null = null;

  // ── Review modal ──────────────────────────────────────────────────────────
  showReviewModal     = false;
  declarationAccepted = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb:         FormBuilder,
    private http:       HttpClient, 
    private route:      ActivatedRoute,
    private router:     Router,
    private toast:      ToastService,
    private masterData: MasterDataService,
    private vatService: VatRegistrationService,
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

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

  // ── Form ───────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group(
      {
        taxpayerId:       [null],
        businessId:       [null],
        vatZoneId:        [null, Validators.required],
        vatCircleId:      [null, Validators.required],
        districtId:       [null],
        divisionId:       [null],
        vatCategory:      ['', Validators.required],
        returnPeriod:     ['Monthly', Validators.required],
        annualTurnover:   [0],
        registrationDate: [new Date().toISOString().split('T')[0]],
        effectiveDate:    [''],
        expiryDate:       [''],
        remarks:          [''],
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

  // ── Static dropdowns ───────────────────────────────────────────────────────

  private loadStaticDropdowns(): void {
    this.masterData.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.divisions = data));
  }

  // ── Cascade: Division → District → Zone → Circle ──────────────────────────

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
          catchError(() => of([])),
          finalize(() => (this.loadingZones = false)),
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
          catchError(() => of([])),
          finalize(() => (this.loadingCircles = false)),
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

  // ── Document upload ────────────────────────────────────────────────────────

  onFileSelected(event: Event, key: DocKey): void {
    const input  = event.target as HTMLInputElement;
    const file   = input.files?.[0];
    // Reset the input immediately so the same file can be re-selected after removal
    input.value  = '';
    if (!file) return;

    if (file.size > this.MAX_FILE_BYTES) {
      this.toast.error(`"${file.name}" exceeds the 5 MB limit. Please choose a smaller file.`);
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.toast.error('Only PDF, JPG, PNG, or WEBP files are accepted.');
      return;
    }

    this.uploadedFiles = { ...this.uploadedFiles, [key]: file };
    this.toast.success(`"${file.name}" attached successfully.`);
  }

  removeFile(key: DocKey): void {
    this.uploadedFiles = { ...this.uploadedFiles, [key]: null };
  }

  isDocUploaded(key: DocKey): boolean {
    return this.uploadedFiles[key] !== null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024)         return `${bytes} B`;
    if (bytes < 1_048_576)    return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  }

  get uploadCount(): number {
    return Object.values(this.uploadedFiles).filter(Boolean).length;
  }

  private resetUploadedFiles(): void {
    this.uploadedFiles = { tradeLicense: null, tinCertificate: null, nidAuthorized: null };
  }

  // ── Draft ─────────────────────────────────────────────────────────────────

  private setupDraftAutoSave(): void {
    this.form.valueChanges.pipe(debounceTime(800), takeUntil(this.destroy$))
      .subscribe(() => this.saveDraft());
  }

  private saveDraft(): void {
    if (!this.selectedTaxpayer) return;
    const draft: VatRegDraft = {
      savedAt:          new Date().toISOString(),
      currentStep:      this.currentStep,
      selectedTaxpayer: this.selectedTaxpayer,
      businesses:       this.businesses,
      selectedBusiness: this.selectedBusiness,
      formValues:       this.form.getRawValue(),
      // Note: uploadedFiles (File objects) cannot be serialised — officer
      // must re-attach documents after restoring a draft from a page refresh.
    };
    try { localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft)); } catch { /* quota */ }
  }

  private restoreDraft(): void {
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) return;
      const draft: VatRegDraft = JSON.parse(raw);
      if (!draft?.selectedTaxpayer) { this.clearDraft(); return; }
      this._pendingDraft   = draft;
      this.showDraftBanner = true;
    } catch { this.clearDraft(); }
  }

  private applyDraft(draft: VatRegDraft): void {
    this.selectedTaxpayer = draft.selectedTaxpayer;
    this.businesses       = draft.businesses ?? [];
    this.selectedBusiness = draft.selectedBusiness;
    this.currentStep      = draft.currentStep ?? 1;
    const fv = draft.formValues;
    this.form.patchValue({
      taxpayerId: fv['taxpayerId'],   businessId: fv['businessId'],
      vatCategory: fv['vatCategory'], returnPeriod: fv['returnPeriod'] ?? 'Monthly',
      annualTurnover: fv['annualTurnover'] ?? 0,
      registrationDate: fv['registrationDate'], effectiveDate: fv['effectiveDate'],
      expiryDate: fv['expiryDate'],   remarks: fv['remarks'],
    }, { emitEvent: false });
    if (fv['divisionId']) {
      this.pendingDistrictId  = fv['districtId']  ?? null;
      this.pendingVatZoneId   = fv['vatZoneId']   ?? null;
      this.pendingVatCircleId = fv['vatCircleId'] ?? null;
      this.form.patchValue({ divisionId: fv['divisionId'] });
    }
  }

  dismissDraft(): void {
    if (this._pendingDraft) {
      this.applyDraft(this._pendingDraft);
      this.toast.info('Draft restored. Please re-attach any documents.');
    }
    this._pendingDraft = null; this.showDraftBanner = false;
  }

  discardDraft(): void {
    this._pendingDraft = null; this.showDraftBanner = false;
    this.clearDraft(); this.toast.info('Draft discarded. Starting fresh.');
  }

  private clearDraft(): void {
    try { localStorage.removeItem(this.DRAFT_KEY); } catch { /* ignore */ }
  }

  get draftSavedAt(): string {
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) return '';
      const { savedAt } = JSON.parse(raw) as VatRegDraft;
      if (!savedAt) return '';
      const mins = Math.floor((Date.now() - new Date(savedAt).getTime()) / 60_000);
      if (mins < 1)  return 'just now';
      if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs  < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
      return new Date(savedAt).toLocaleDateString();
    } catch { return ''; }
  }

  // ── Wizard helpers ─────────────────────────────────────────────────────────

  get isCompany(): boolean {
    return this.selectedTaxpayer?.taxpayerType?.typeName
      ?.toLowerCase().includes('company') ?? false;
  }

  get stepOneComplete(): boolean { return this.selectedTaxpayer !== null; }
  get stepTwoComplete(): boolean { return this.isCompany || this.selectedBusiness !== null; }
  get canSubmit():       boolean { return this.form.valid && this.stepOneComplete && this.stepTwoComplete; }
  get displayName():     string  { return this.getTaxpayerDisplayName(this.selectedTaxpayer); }

  private getTaxpayerDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    return tp.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? (tp.companyName ?? 'Unknown Company')
      : (tp.fullName    ?? 'Unknown');
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────

  onTaxpayerSelected(tp: Taxpayer): void {
    this.selectedTaxpayer = tp;
    this.form.patchValue({ taxpayerId: tp.id });
    this.toast.success(`"${this.getTaxpayerDisplayName(tp)}" selected.`);
    if (this.isCompany) {
      this.currentStep = 3;
      this.toast.info('Company taxpayer — skipping business selection.');
    } else {
      this.currentStep = 2;
      this.loadBusinesses(tp.id!);
    }
    this.saveDraft();
  }

  onTaxpayerCleared(): void {
    this.selectedTaxpayer = null; this.selectedBusiness = null; this.businesses = [];
    this.currentStep = 1; this.districts = []; this.vatZones = []; this.vatCircles = [];
    this.resetUploadedFiles();
    this.form.reset({ registrationDate: new Date().toISOString().split('T')[0], returnPeriod: 'Monthly' });
    this.clearDraft(); this.toast.info('Taxpayer cleared. Starting over.');
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────

  private loadBusinesses(taxpayerId: number): void {
    // TODO Phase 6: migrate to BusinessService with mock fallback
    this.loadingBusinesses = true; this.businesses = [];
    this.http
      .get<BusinessVatStatus[]>(API_ENDPOINTS.BUSINESSES.BY_TAXPAYER_VAT_STATUS(taxpayerId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loadingBusinesses = false)))
      .subscribe({
        next:  data => { this.businesses = data; if (!data.length) this.toast.warning('No registered businesses for this taxpayer.'); },
        error: () => {},
      });
  }

  onBusinessSelected(b: BusinessVatStatus): void {
    this.selectedBusiness = b;
    this.form.patchValue({ businessId: b.id });
    if (b.divisionId) {
      this.pendingDistrictId = b.districtId ?? null;
      this.form.patchValue({ divisionId: b.divisionId });
    }
    this.toast.success(`"${b.businessName}" selected. Pick the VAT Zone and Circle to continue.`);
    this.currentStep = 3; this.saveDraft();
  }

  // ── Step navigation ────────────────────────────────────────────────────────

  goBack(): void {
    if      (this.currentStep === 3) this.currentStep = this.isCompany ? 1 : 2;
    else if (this.currentStep === 2) this.currentStep = 1;
  }

  // ── Step 3 display helpers ─────────────────────────────────────────────────

  get autoBusinessName(): string {
    return this.isCompany
      ? (this.selectedTaxpayer?.companyName ?? '')
      : (this.selectedBusiness?.businessName ?? '');
  }

  get editBusinessId(): number | null { return this.selectedBusiness?.id ?? null; }

  formatTurnoverDisplay(amount: number | undefined | null): string {
    if (!amount) return '0';
    return amount.toLocaleString('en-IN');
  }

  // ── Review modal helpers ───────────────────────────────────────────────────

  get reviewZoneName():     string { return this.vatZones.find(z => z.id == this.ctrl('vatZoneId')?.value)?.name    ?? '—'; }
  get reviewCircleName():   string { return this.vatCircles.find(c => c.id == this.ctrl('vatCircleId')?.value)?.name ?? '—'; }
  get reviewDistrictName(): string { return this.districts.find(d => d.id == this.ctrl('districtId')?.value)?.name  ?? '—'; }
  get reviewDivisionName(): string { return this.divisions.find(d => d.id == this.ctrl('divisionId')?.value)?.name  ?? '—'; }

  get vatCategoryLabel(): string {
    const v = this.ctrl('vatCategory')?.value;
    return this.vatCategoryOptions.find(o => o.value === v)?.label ?? v ?? '';
  }

  onOpenReview(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please complete all required fields before reviewing.');
      return;
    }
    if (!this.canSubmit) return;
    this.declarationAccepted = false;
    this.showReviewModal     = true;
  }

  onCloseReview(): void { this.showReviewModal = false; }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onConfirmSubmit(): void {
    if (!this.declarationAccepted || this.isLoading) return;
    this.showReviewModal = false;
    this.isLoading       = true;

    const raw = this.form.getRawValue();
    const payload: VatRegistrationCreateRequest = {
      taxpayerId:       raw['taxpayerId'],
      businessId:       raw['businessId']    ?? null,
      vatZoneId:        raw['vatZoneId'],
      vatCircleId:      raw['vatCircleId'],
      districtId:       raw['districtId']    ?? null,
      divisionId:       raw['divisionId']    ?? null,
      vatCategory:      raw['vatCategory'],
      returnPeriod:     raw['returnPeriod']  ?? 'Monthly',
      registrationDate: raw['registrationDate'],
      effectiveDate:    raw['effectiveDate'] || undefined,
      expiryDate:       raw['expiryDate']    || undefined,
      remarks:          raw['remarks']       || undefined,
    };

    // TODO Phase 6: attach uploadedFiles as FormData for multipart upload

    this.vatService.create(payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (created: VatRegistration) => {
          this.toast.success('VAT registration submitted successfully!');
          this.clearDraft();
          this.router.navigate(['/../success'], {
            relativeTo: this.route,
            state: { registration: created },
          });
        },
        error: () => {},
      });
  }

  // ── Reset / Cancel ─────────────────────────────────────────────────────────

  onReset(): void {
    this.selectedTaxpayer   = null; this.selectedBusiness = null; this.businesses = [];
    this.currentStep        = 1;
    this.pendingDistrictId  = null; this.pendingVatZoneId = null; this.pendingVatCircleId = null;
    this.districts = []; this.vatZones = []; this.vatCircles = [];
    this.showReviewModal     = false; this.declarationAccepted = false;
    this.resetUploadedFiles();
    this.form.reset({
      registrationDate: new Date().toISOString().split('T')[0],
      returnPeriod: 'Monthly', annualTurnover: 0,
    });
    this.clearDraft(); this.toast.info('Form reset.');
  }

  onCancel(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['..'], {
        relativeTo: this.route
      });
    }
  }
}