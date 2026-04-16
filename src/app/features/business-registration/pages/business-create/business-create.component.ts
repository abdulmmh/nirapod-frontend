import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { MasterDataService } from 'src/app/core/services/master-data.service';
import { BusinessCreateRequest, BusinessStatus } from 'src/app/models/business.model';
import { Taxpayer } from 'src/app/models/taxpayer.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Division, District, BusinessType, BusinessCategory } from 'src/app/models/master-data.model';

@Component({
  selector: 'app-business-create',
  templateUrl: './business-create.component.html',
  styleUrls: ['./business-create.component.css'],
})
export class BusinessCreateComponent implements OnInit, OnDestroy {

  isLoading = false;
  form: BusinessCreateRequest = this.getEmptyForm();

  private destroy$ = new Subject<void>();

  // ── Taxpayer Search (TIN-style: button-triggered) ──
  searchQuery       = '';
  isSearching       = false;
  searchResults:    Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults       = false;
  hasSearched       = false;

  // Computed getter — mirrors tin-create pattern
  get isAutoFilled(): boolean { return this.selectedTaxpayer !== null; }

  // Dropdown master data
  divisions:          Division[]      = [];
  districts:          District[]      = [];
  businessTypes:      BusinessType[]     = [];
  businessCategories: BusinessCategory[] = [];
  statuses: BusinessStatus[] = ['Active', 'Inactive', 'Suspended', 'Cancelled', 'Pending'];

  constructor(
    private router:      Router,
    private toast:       ToastService,
    private masterData:  MasterDataService,
    private http:        HttpClient,
  ) {}

  // ──────────────── Lifecycle ────────────────

  ngOnInit(): void {
    this.loadMasterData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────── Master Data ────────────────

  private loadMasterData(): void {
    this.masterData.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  data => this.divisions = data,
        error: ()   => this.toast.error('Failed to load divisions.'),
      });

    this.masterData.getBusinessTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  data => this.businessTypes = data,
        error: ()   => this.toast.error('Failed to load business types.'),
      });

    this.masterData.getBusinessCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  data => this.businessCategories = data,
        error: ()   => this.toast.error('Failed to load categories.'),
      });
  }

  // ──────────────── Taxpayer Search (TIN-style) ────────────────

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults   = false;
      this.hasSearched   = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q) { this.toast.warning('Enter TIN number or taxpayer name.'); return; }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    const url = `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`;
    this.http.get<Taxpayer[]>(url)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        next:  (data) => this.handleSearchSuccess(data, q),
        error: ()     => this.toast.error('Taxpayer search failed. Please try again.'),
      });
  }

  private handleSearchSuccess(data: Taxpayer[], query: string): void {
    const q = query.toLowerCase();
    this.searchResults = data.filter(t =>
      t.tinNumber?.toLowerCase().includes(q) || t.fullName?.toLowerCase().includes(q)
    );
    this.showResults = true;
    this.hasSearched = true;
    if (this.searchResults.length === 0) {
      this.toast.info('No taxpayer found. Please check the TIN or name.');
    }
  }

  selectTaxpayer(taxpayer: Taxpayer): void {
    this.selectedTaxpayer = taxpayer;
    this.showResults      = false;
    // this.searchQuery      = taxpayer.fullName;

    // Form auto-fill
    // this.form.taxpayerId = taxpayer.id;
    this.form.tinNumber  = taxpayer.tinNumber || '';
    this.form.ownerName  = taxpayer.fullName  || '';

    this.toast.success(`"${taxpayer.fullName}" details auto-filled.`);
  }

  clearTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.searchQuery      = '';
    this.searchResults    = [];
    this.showResults      = false;
    this.hasSearched      = false;
    this.form.taxpayerId  = 0;
    this.form.tinNumber   = '';
    this.form.ownerName   = '';
    this.toast.info('Taxpayer cleared.');
  }

  // ──────────────── Division / District ────────────────

  onDivisionChange(): void {
    this.form.districtId = 0;
    this.districts = [];

    if (this.form.divisionId) {
      this.masterData.getDistrictsByDivision(this.form.divisionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next:  data => this.districts = data,
          error: ()   => this.toast.error('Failed to load districts.'),
        });
    }
  }

  // ──────────────── Validation ────────────────

  isFormValid(): boolean {
    return !!(
      this.form.taxpayerId         &&
      this.form.businessName       &&
      this.form.tinNumber          &&
      this.form.ownerName          &&
      this.form.businessTypeId     &&
      this.form.businessCategoryId &&
      this.form.phone              &&
      this.form.divisionId         &&
      this.form.districtId         &&
      this.form.status             &&
      this.form.registrationDate
    ) && this.isEmailValid();
  }

  isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

  // ──────────────── Submit ────────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields with valid values.');
      return;
    }
    this.isLoading = true;

    const payload = this.buildPayload();

    this.http.post(API_ENDPOINTS.BUSINESSES.CREATE, payload)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false))
      .subscribe({
        next:  () => this.handleSuccess(),
        error: (err) => this.handleError(err),
      });
  }

  private buildPayload(): any {
    return {
      businessName:      this.form.businessName,
      tinNumber:         this.form.tinNumber,
      ownerName:         this.form.ownerName,
      tradeLicenseNo:    this.form.tradeLicenseNo,
      binNo:             this.form.binNo,
      incorporationDate: this.form.incorporationDate || null,
      registrationDate:  this.form.registrationDate,
      expiryDate:        this.form.expiryDate || null,
      email:             this.form.email,
      phone:             this.form.phone,
      address:           this.form.address,
      annualTurnover:    this.form.annualTurnover,
      numberOfEmployees: this.form.numberOfEmployees,
      status:            this.form.status,
      remarks:           this.form.remarks,
      taxpayer:         { id: this.form.taxpayerId },
      division:         { id: this.form.divisionId },
      district:         { id: this.form.districtId },
      businessType:     { id: this.form.businessTypeId },
      businessCategory: { id: this.form.businessCategoryId },
    };
  }

  private handleSuccess(): void {
    this.toast.success('Business registered successfully!');
    setTimeout(() => this.router.navigate(['/businesses']), 1500);
  }

  private handleError(error: unknown): void {
    console.error('Error creating business:', error);
    this.toast.error('Failed to create business. Please try again.');
  }

  // ──────────────── Reset / Cancel ────────────────

  onReset(): void {
    this.form = this.getEmptyForm();
    this.districts = [];
    this.clearTaxpayer();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/businesses']);
  }

  // ──────────────── Form Factory ────────────────

  private getEmptyForm(): BusinessCreateRequest {
    return {
      taxpayerId:         0,
      businessName:       '',
      tinNumber:          '',
      ownerName:          '',
      businessTypeId:     0,
      businessCategoryId: 0,
      tradeLicenseNo:     '',
      binNo:              '',
      incorporationDate:  '',
      registrationDate:   new Date().toISOString().split('T')[0],
      expiryDate:         '',
      email:              '',
      phone:              '',
      status:             'Active',
      address:            '',
      divisionId:         0,
      districtId:         0,
      annualTurnover:     0,
      numberOfEmployees:  0,
      remarks:            '',
    };
  }
}