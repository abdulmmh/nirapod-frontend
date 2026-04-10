import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { Business } from '../../../../models/business.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-business-edit',
  templateUrl: './business-edit.component.html',
  styleUrls: ['./business-edit.component.css'],
})
export class BusinessEditComponent implements OnInit, OnDestroy {
 
  // ──────── Properties ──────────

  isLoading = true;
  isSaving = false;
  businessId: number | null = null;

  form: Partial<Business> = {};

  private destroy$ = new Subject<void>();

  // ────────── Static Data ──────────────

  readonly businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Private Limited',
    'Public Limited',
    'NGO',
    'Other',
  ];

  readonly businessCategories = [
    'Manufacturing',
    'Trading',
    'Service',
    'Agriculture',
    'Construction',
    'IT',
    'Healthcare',
    'Education',
    'Other',
  ];

  readonly statuses = [
    'Active',
    'Inactive',
    'Pending',
    'Suspended',
    'Dissolved',
  ];

  readonly divisions = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh',
  ];

  readonly districts: Record<string, string[]> = {
    Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Narsingdi'],
    Chittagong: [
      'Chittagong',
      "Cox's Bazar",
      'Comilla',
      'Feni',
      'Brahmanbaria',
    ],
    Rajshahi: ['Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Natore'],
    Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Kushtia'],
    Barisal: ['Barisal', 'Bhola', 'Patuakhali', 'Jhalokati', 'Pirojpur'],
    Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    Rangpur: ['Rangpur', 'Dinajpur', 'Kurigram', 'Gaibandha', 'Lalmonirhat'],
    Mymensingh: ['Mymensingh', 'Netrokona', 'Jamalpur', 'Sherpur'],
  };

  // ─────────  Getter ───────────────

  get availableDistricts(): string[] {
    return this.districts[this.form.division ?? ''] || [];
  }

  // ─────────── Constructor ──────────────

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  // ───────────── Lifecycle ──────────────────

  ngOnInit(): void {
    this.initializeBusiness();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────── Initialization  ─────────────

  private initializeBusiness(): void {
    const id = this.getValidBusinessId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.businessId = id;
    this.fetchBusiness();
  }

  // ───────────  Data Fetching ───────────────

  private fetchBusiness(): void {
    if (!this.businessId) return;

    this.isLoading = true;

    this.http
      .get<Business>(API_ENDPOINTS.BUSINESSES.GET(this.businessId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Business): void {
    this.form = { ...data };

    if (data.expiryDate && this.isExpired(data.expiryDate)) {
      this.toast.warning(
        'This business license has expired. Please update the expiry date.',
      );
    }
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading business data:', error);
    this.toast.error(
      'Failed to load business data. Please refresh or go back.',
    );
  }

  // ─────────── Events  ────────────────

  onDivisionChange(): void {
    this.form.district = '';
  }

  onCancel(): void {
    this.router.navigate(['/businesses/view', this.businessId]);
  }

  // ────────── Validation ───────────────

  private getValidBusinessId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid business ID. Please go back and try again.');
  }

  isFormValid(): boolean {
    return this.hasRequiredFields() && this.isEmailValid();
  }

  private hasRequiredFields(): boolean {
    return !!(
      this.form.businessName &&
      this.form.tinNumber &&
      this.form.ownerName &&
      this.form.businessType &&
      this.form.businessCategory &&
      this.form.tradeLicenseNo &&
      this.form.phone &&
      this.form.division &&
      this.form.district &&
      this.form.status &&
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

  // ───────── Actions  ─────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    }

    if (!this.businessId) {
      this.handleInvalidId();
      return;
    }

    this.isSaving = true;
    this.updateBusiness();
  }

  private updateBusiness(): void {
    this.http
      .put(API_ENDPOINTS.BUSINESSES.UPDATE(this.businessId!), this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => this.handleUpdateSuccess(),
        error: (error) => this.handleUpdateError(error),
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

  private showValidationWarning(): void {
    this.toast.warning('Please fill in all required fields with valid values.');
  }
}
