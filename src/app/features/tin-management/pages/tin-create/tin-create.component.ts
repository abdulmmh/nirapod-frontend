import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TinCreateRequest } from '../../../../models/tin.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-tin-create',
  templateUrl: './tin-create.component.html',
  styleUrls: ['./tin-create.component.css'],
})
export class TinCreateComponent {

  // ──────────────── Properties ────────────────
  
  isLoading = false;

  form: TinCreateRequest = this.getEmptyForm();

  private destroy$ = new Subject<void>();


  // ──────────────── Static Data ────────────────

  tinCategories = ['Individual', 'Company', 'Partnership', 'NGO', 'Government'];
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
  taxZones = ['Zone-1', 'Zone-2', 'Zone-3', 'Zone-4', 'Zone-5', 'Zone-6'];
  taxCircles = [
    'Circle-1',
    'Circle-2',
    'Circle-3',
    'Circle-4',
    'Circle-5',
    'Circle-6',
    'Circle-7',
    'Circle-8',
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

  private getEmptyForm(): TinCreateRequest {
    return {
      taxpayerName: '',
      tinCategory: '',
      nationalId: '',
      passportNo: '',
      dateOfBirth: '',
      incorporationDate: '',
      email: '',
      phone: '',
      address: '',
      district: '',
      division: '',
      taxZone: '',
      taxCircle: '',
      issuedDate: new Date().toISOString().split('T')[0],
      remarks: '',
    };
  }


  // ────────── Getters ─────────────

  get isIndividual(): boolean {
    return this.form.tinCategory === 'Individual';
  }

  get isCompany(): boolean {
    return ['Company', 'Partnership', 'NGO', 'Government'].includes(
      this.form.tinCategory,
    );
  }

  get availableDistricts(): string[] {
    return this.districts[this.form.division] || [];
  }


  // ────────── Event Handlers ─────────────

  onDivisionChange(): void {
    this.form.district = '';
  }

  // ──────────────── Validation  ───────────────

  isFormValid(): boolean {
    return !!(
      this.form.taxpayerName &&
      this.form.tinCategory &&
      this.form.phone &&
      this.form.taxZone &&
      this.form.taxCircle &&
      this.form.issuedDate &&
      (this.isIndividual
        ? this.form.nationalId || this.form.passportNo
        : true) &&
      this.form.division &&
      this.form.district
    );
  }


 // ──────────────── Actions ────────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    }

    this.isLoading = true;
    this.createTin();
  }

  private createTin(): void {
    this.http
      .post(API_ENDPOINTS.TINS.CREATE, this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error),
      });
  }

  private handleSuccess(): void {
    this.toast.success('Tin record created successfully!');
    setTimeout(() => this.router.navigate(['/tins']), 1500);
  }

  private handleError(error: unknown): void {
    console.error('Error creating TIN records:', error);
    this.toast.error('Failed to create TIN records. Please try again.');
  }
  
  private showValidationWarning(): void {
    this.toast.warning('Please fill in all required fields with valid values.');
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/tin']);
  }
}
