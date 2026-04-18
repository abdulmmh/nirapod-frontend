import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { MasterDataService } from '../../../../core/services/master-data.service';
import {
  Division, District, BusinessType, BusinessCategory
} from '../../../../models/master-data.model';

@Component({
  selector: 'app-vat-registration-create',
  templateUrl: './vat-registration-create.component.html',
  styleUrls: ['./vat-registration-create.component.css']
})
export class VatRegistrationCreateComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  // ── Taxpayer Search ──────────────────────────────────────────────────────
  searchQuery   = '';
  isSearching   = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults   = false;
  hasSearched   = false;

  // ── Static dropdowns ─────────────────────────────────────────────────────
  vatCategories = ['Standard', 'Zero Rated', 'Exempt', 'Special'];

  // ── Dynamic dropdowns (from MasterDataService) ───────────────────────────
  divisions:          Division[]         = [];
  districts:          District[]         = [];
  businessTypes:      BusinessType[]     = [];
  businessCategories: BusinessCategory[] = [];

  // VAT Zone & Circle — loaded by district/zone chain
  vatZones:   any[] = [];
  vatCircles: any[] = [];

  // Loading states for cascading dropdowns
  loadingDistricts  = false;
  loadingZones      = false;
  loadingCircles    = false;

  constructor(
    private fb:             FormBuilder,
    private http:           HttpClient,
    private router:         Router,
    private toast:          ToastService,
    private masterData:     MasterDataService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadStaticDropdowns();
    this.setupCascadeListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      taxpayerId:       [null],
      tinNumber:        ['', Validators.required],
      businessName:     ['', Validators.required],
      ownerName:        [''],
      vatCategory:      ['', Validators.required],
      businessTypeId:   [null],
      businessCategoryId:[null],
      tradeLicenseNo:   [''],
      divisionId:       [null],
      districtId:       [null],
      vatZoneId:        [null, Validators.required],
      vatCircleId:      [null, Validators.required],
      registrationDate: [new Date().toISOString().split('T')[0]],
      effectiveDate:    [''],
      expiryDate:       [''],
      annualTurnover:   [0],
      email:            ['', Validators.email],
      phone:            ['', Validators.required],
      address:          [''],
      remarks:          ['']
    });
  }

  ctrl(name: string) { return this.form.get(name); }

  // ── Load all static/initial dropdowns ────────────────────────────────────

  private loadStaticDropdowns(): void {
    this.masterData.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.divisions = data);

    this.masterData.getBusinessTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.businessTypes = data);

    this.masterData.getBusinessCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.businessCategories = data);
  }

  // ── Cascade Listeners: Division → District → Zone → Circle ───────────────

  private setupCascadeListeners(): void {

    // Division change → load Districts, reset downstream
    this.form.get('divisionId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(divisionId => {
        this.districts  = [];
        this.vatZones   = [];
        this.vatCircles = [];
        this.form.patchValue({ districtId: null, vatZoneId: null, vatCircleId: null });

        if (!divisionId) return;

        this.loadingDistricts = true;
        this.masterData.getDistrictsByDivision(divisionId)
          .pipe(takeUntil(this.destroy$), finalize(() => this.loadingDistricts = false))
          .subscribe(data => this.districts = data);
      });

    // District change → load Tax Zones, reset downstream
    this.form.get('districtId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(districtId => {
        this.vatZones   = [];
        this.vatCircles = [];
        this.form.patchValue({ vatZoneId: null, vatCircleId: null });

        if (!districtId) return;

        this.loadingZones = true;
        this.masterData.getTaxZonesByDistrict(districtId)
          .pipe(takeUntil(this.destroy$), finalize(() => this.loadingZones = false))
          .subscribe(data => this.vatZones = data);
      });

    // Zone change → load Tax Circles
    this.form.get('vatZoneId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(zoneId => {
        this.vatCircles = [];
        this.form.patchValue({ vatCircleId: null });

        if (!zoneId) return;

        this.loadingCircles = true;
        this.masterData.getTaxCirclesByZone(zoneId)
          .pipe(takeUntil(this.destroy$), finalize(() => this.loadingCircles = false))
          .subscribe(data => this.vatCircles = data);
      });
  }

  // ── Taxpayer Search ───────────────────────────────────────────────────────

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    const type = tp.taxpayerType?.typeName?.toLowerCase() || '';
    return type.includes('company') ? (tp.companyName || 'Unknown') : (tp.fullName || 'Unknown');
  }

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults   = false;
      this.hasSearched   = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q) { this.toast.warning('Enter a TIN number, NID or business name to search.'); return; }
    if (q.length < 3) { this.toast.warning('Enter at least 3 characters to search.'); return; }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    this.http.get<Taxpayer[]>(`${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        next: (data) => {
          this.searchResults = data;
          this.showResults   = true;
          this.hasSearched   = true;
          if (data.length === 0) this.toast.info('No taxpayer found. Fill in TIN and details manually.');
        },
        error: () => this.toast.error('Search failed. Please try again.')
      });
  }

  selectTaxpayer(tp: Taxpayer): void {
    this.selectedTaxpayer = tp;
    this.showResults      = false;
    const name = this.getDisplayName(tp);

    this.form.patchValue({
      taxpayerId:   tp.id,
      tinNumber:    tp.tinNumber || '',
      ownerName:    name,
      businessName: tp.companyName || ''
    });

    this.form.get('taxpayerId')?.disable();
    this.form.get('tinNumber')?.disable();

    this.toast.success(`"${name}" auto-filled. Complete the VAT details to continue.`);
  }

  clearSelectedTaxpayer(silent = false): void {
    this.selectedTaxpayer = null;
    this.searchQuery      = '';
    this.searchResults    = [];
    this.showResults      = false;
    this.hasSearched      = false;

    this.form.get('taxpayerId')?.enable();
    this.form.get('tinNumber')?.enable();
    this.form.patchValue({ taxpayerId: null, tinNumber: '', ownerName: '', businessName: '' });

    if (!silent) this.toast.info('Taxpayer cleared.');
  }

  get isAutoFilled(): boolean { return this.selectedTaxpayer !== null; }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    const payload = this.form.getRawValue();

    this.http.post(API_ENDPOINTS.VAT_REGISTRATIONS.CREATE, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.toast.success('VAT Registration submitted successfully!');
          setTimeout(() => this.router.navigate(['/vat-registration']), 1500);
        },
        error: (err) => {
          if (err?.status === 409) {
            this.toast.error(err.error?.message || 'A VAT registration already exists for this TIN.');
          } else if (err?.status === 400) {
            this.toast.error(err.error?.message || 'Invalid data. Please check all fields.');
          } else {
            this.toast.error('Failed to submit VAT registration. Please try again.');
          }
        }
      });
  }

  onReset(): void {
    this.clearSelectedTaxpayer(true);
    this.districts  = [];
    this.vatZones   = [];
    this.vatCircles = [];
    this.form.reset({
      registrationDate: new Date().toISOString().split('T')[0],
      annualTurnover: 0
    });
    this.form.get('taxpayerId')?.enable();
    this.form.get('tinNumber')?.enable();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void { this.router.navigate(['/vat-registration']); }
}
