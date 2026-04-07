import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Business } from '../../../../models/business.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-business-edit',
  templateUrl: './business-edit.component.html',
  styleUrls: ['./business-edit.component.css'],
})
export class BusinessEditComponent implements OnInit, OnDestroy {
  isLoading = true;
  isSaving = false;
  businessId: number | null = null;

  businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Private Limited',
    'Public Limited',
    'NGO',
    'Other',
  ];
  businessCategories = [
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
  statuses = ['Active', 'Inactive', 'Pending', 'Suspended', 'Dissolved'];
  divisions = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh',
  ];

  districts: Record<string, string[]> = {
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

  form: Partial<Business> = {};

  private destroy$ = new Subject<void>();

  get availableDistricts(): string[] {
    return this.districts[this.form.division ?? ''] || [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.toast.error('Invalid business ID. Please go back and try again.');
      return;
    }

    this.businessId = parsedId;
    this.loadBusiness();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────────

  loadBusiness(): void {
    this.isLoading = true;

    this.http
      .get<Business>(API_ENDPOINTS.BUSINESSES.GET(this.businessId!))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.form = { ...data };
          this.isLoading = false;

          // WARNING: license already expired
          if (data.expiryDate && this.isExpired(data.expiryDate)) {
            this.toast.warning(
              'This business license has expired. Please update the expiry date.',
            );
          }
        },
        error: () => {
          this.isLoading = false;
          this.toast.error(
            'Failed to load business data. Please refresh or go back.',
          );
        },
      });
  }

  // ─── Event Handlers ───────────────────────────────────────────────────────────

  onDivisionChange(): void {
    this.form.district = '';
  }

  // ─── Validation ───────────────────────────────────────────────────────────────

  isFormValid(): boolean {
    const requiredFields = !!(
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

    return requiredFields && this.isEmailValid();
  }

  isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

  // ─── Form Actions ─────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning(
        'Please fill in all required fields with valid values.',
      );
      return;
    }

    this.isSaving = true;

    this.http
      .put(API_ENDPOINTS.BUSINESSES.UPDATE(this.businessId!), this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toast.success('Business updated successfully!');
          setTimeout(() => this.router.navigate(['/businesses']), 1500);
        },
        error: () => {
          this.isSaving = false;
          this.toast.error('Failed to update business. Please try again.');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/businesses/view', this.businessId]);
  }
}
