import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { Business, BusinessCategory, BusinessType } from '../../../../models/business.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { MasterDataService, Division, District } from 'src/app/core/services/master-data.service';

@Component({
  selector: 'app-business-edit',
  templateUrl: './business-edit.component.html',
  styleUrls: ['./business-edit.component.css'],
})
export class BusinessEditComponent implements OnInit, OnDestroy {

  isLoading = true;
  isSaving  = false;
  businessId: number | null = null;

  form: Partial<Business> = {};

  private destroy$ = new Subject<void>();

  divisions:          Division[]        = [];
  districts:          District[]        = [];
  businessTypes:      BusinessType[]    = [];
  businessCategories: BusinessCategory[] = [];

  readonly statuses = ['Active', 'Inactive', 'Pending', 'Suspended', 'Dissolved'];

  constructor(
    private route:      ActivatedRoute,
    private router:     Router,
    private http:       HttpClient,
    private toast:      ToastService,
    private masterData: MasterDataService,
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
    this.initializeBusiness();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────── Master Data Load ──────────────

  private loadMasterData(): void {
    this.masterData.getDivisions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.divisions = data,
        error: () => this.toast.error('Failed to load divisions.')
      });

    this.masterData.getBusinessTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.businessTypes = data,
        error: () => this.toast.error('Failed to load business types.')
      });

    this.masterData.getBusinessCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.businessCategories = data,
        error: () => this.toast.error('Failed to load categories.')
      });
  }

  // ─────────── Initialization ─────────────

  private initializeBusiness(): void {
    const id = this.getValidBusinessId();
    if (!id) { this.handleInvalidId(); return; }
    this.businessId = id;
    this.fetchBusiness();
  }

  private getValidBusinessId(): number | null {
    const rawId    = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);
    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid business ID. Please go back and try again.');
  }

  // ─────────── Data Fetching ───────────────

  private fetchBusiness(): void {
    if (!this.businessId) return;
    this.isLoading = true;

    this.http
      .get<Business>(API_ENDPOINTS.BUSINESSES.GET(this.businessId))
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false))
      .subscribe({
        next:  data  => this.handleFetchSuccess(data),
        error: error => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Business): void {
    
    // Extract IDs for the form dropdowns
    this.form = {
      ...data,
      divisionId: data.division?.id ?? data.divisionId,
      districtId: data.district?.id ?? data.districtId,
    };

    // Load districts for the selected division
    const divId = this.form.divisionId;
    if (divId) {
      this.loadDistrictsForEdit(divId);
    }

    if (data.expiryDate && this.isExpired(data.expiryDate)) {
      this.toast.warning('This business license has expired. Please update the expiry date.');
    }
  }

  private loadDistrictsForEdit(divisionId: number): void {
    this.masterData.getDistrictsByDivision(divisionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.districts = data,
        error: () => this.toast.error('Failed to load districts.')
      });
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading business data:', error);
    this.toast.error('Failed to load business data. Please refresh or go back.');
  }

  // ─────────── Events ────────────────

  onDivisionChange(): void {
    const divId = this.form.divisionId;
    this.form.districtId = undefined;
    this.districts = [];

    if (divId) {
      this.masterData.getDistrictsByDivision(Number(divId))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: data => this.districts = data,
          error: () => this.toast.error('Failed to load districts.')
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/businesses/view', this.businessId]);
  }

  // ────────── Validation ───────────────

  isFormValid(): boolean {
    return this.hasRequiredFields() && this.isEmailValid();
  }

  private hasRequiredFields(): boolean {
    return !!(
      this.form.businessName     &&
      this.form.tinNumber        &&
      this.form.ownerName        &&
      this.form.businessType     &&
      this.form.businessCategory &&
      this.form.phone            &&
      this.form.divisionId       &&
      this.form.districtId       &&
      this.form.status           &&
      this.form.registrationDate
    );
  }

  private isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

  private isExpired(date: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

  // ─────────── Submit ─────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields with valid values.');
      return;
    }
    if (!this.businessId) { this.handleInvalidId(); return; }
    this.isSaving = true;
    this.updateBusiness();
  }

  private updateBusiness(): void {
    const payload = {
      ...this.form,
      divisionId: this.form.divisionId,
      districtId: this.form.districtId,
      division:   undefined,
      district:   undefined,
    };

    this.http
      .put(API_ENDPOINTS.BUSINESSES.UPDATE(this.businessId!), payload)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isSaving = false))
      .subscribe({
        next:  ()    => this.handleUpdateSuccess(),
        error: error => this.handleUpdateError(error),
      });
  }

  private handleUpdateSuccess(): void {
    this.toast.success('Business updated successfully!');
    setTimeout(() => this.router.navigate(['/businesses']), 1500);
  }

  private handleUpdateError(error: unknown): void {
    console.error('Error updating business:', error);
    this.toast.error('Failed to update business. Please try again.');
  }
}