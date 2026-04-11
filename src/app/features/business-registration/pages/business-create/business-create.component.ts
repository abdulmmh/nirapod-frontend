import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { BusinessCreateRequest } from '../../../../models/business.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-business-create',
  templateUrl: './business-create.component.html',
  styleUrls: ['./business-create.component.css'],
})
export class BusinessCreateComponent implements OnDestroy {

  // ──────────────── State ────────────────

  isLoading = false;

  form: BusinessCreateRequest = this.getEmptyForm();

  private destroy$ = new Subject<void>();


  // ──────────────── Static Data ────────────────

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

  // ────────────── Constructor  ────────────────

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  // ──────────────── Lifecycle ────────────────

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────── Form Factory  ────────────────

  private getEmptyForm(): BusinessCreateRequest {
    return {
      taxpayerId: 0,
      businessName: '',
      tinNumber: '',
      ownerName: '',
      businessType: '',
      businessCategory: '',
      tradeLicenseNo: '',
      binNo: '',
      incorporationDate: '',
      registrationDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      email: '',
      phone: '',
      address: '',
      district: '',
      division: '',
      annualTurnover: 0,
      numberOfEmployees: 0,
      remarks: '',
    };
  }


  // ────────── Getters ─────────────

  get availableDistricts(): string[] {
    return this.districts[this.form.division] || [];
  }

  // ────────── Event Handlers ─────────────

  onDivisionChange(): void {
    this.form.district = '';
  }

  
  // ──────────────── Validation  ───────────────

  isFormValid(): boolean {
    const requiredFields = !!(
      this.form.taxpayerId &&
      this.form.businessName &&
      this.form.tinNumber &&
      this.form.ownerName &&
      this.form.businessType &&
      this.form.businessCategory &&
      this.form.tradeLicenseNo &&
      this.form.phone &&
      this.form.division &&
      this.form.district &&
      this.form.registrationDate
    );

    return requiredFields && this.isEmailValid();
  }

  isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

  // ──────────────── Actions ────────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    } 

    this.isLoading = true;
    this.createBusiness();
  }

  private createBusiness(): void {
    this.http
      .post(API_ENDPOINTS.BUSINESSES.CREATE, this.form)
      .pipe(takeUntil(this.destroy$),
        finalize(() => this.isLoading = false))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error),
      });
  }

  private handleSuccess(): void {
    this.toast.success('Business created successfully!');
    setTimeout(() => this.router.navigate(['/businesses']), 1500);
  }

  private handleError(error: unknown): void {
    console.error('Error creating business:', error);
    this.toast.error('Failed to create business. Please try again.');
  }
  
  private showValidationWarning(): void {
    this.toast.warning('Please fill in all required fields with valid values.');
  }
  
  onReset(): void {
    this.form = this.getEmptyForm();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/businesses']);
  }
}
