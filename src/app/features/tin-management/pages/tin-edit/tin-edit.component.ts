import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tin } from '../../../../models/tin.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tin-edit',
  templateUrl: './tin-edit.component.html',
  styleUrls: ['./tin-edit.component.css'],
})
export class TinEditComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  tinId: number | null = null;

  tinCategories = ['Individual', 'Company', 'Partnership', 'NGO', 'Government'];
  statuses = ['Active', 'Inactive', 'Pending', 'Suspended', 'Cancelled'];
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

  form: Partial<Tin> = {};

  private destroy$ = new Subject<void>();

  get isIndividual(): boolean {
    return this.form.tinCategory === 'Individual';
  }

  get isCompany(): boolean {
    return ['Company', 'Partnership', 'NGO', 'Government'].includes(
      this.form.tinCategory ?? '',
    );
  }

  get availableDistricts(): string[] {
    return this.districts[this.form.division ?? ''] || [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.toast.error('Invalid business ID. Please go back and try again.');
      return;
    }

    this.tinId = parsedId;
    this.loadTin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

 

loadTin(): void {
  if (!this.tinId) {
    this.toast.error('Invalid TIN ID. Please go back and try again.');
    return;
  }

  this.isLoading = true;

  this.http
    .get<Tin>(API_ENDPOINTS.TINS.UPDATE(this.tinId))
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: (tin: Tin) => {
        this.form = { ...tin };
      },
      error: (error) => {
        console.error('Error loading TIN details:', error);
        this.toast.error('Failed to load TIN details. Please go back and try again.');
      }
    });
}
  isFormValid(): boolean {
    return !!(
      this.form.taxpayerName &&
      this.form.tinCategory &&
      this.form.phone &&
      this.form.taxZone &&
      this.form.taxCircle &&
      this.form.issuedDate &&
      (this.isIndividual ? this.form.nationalId : true) &&
      (this.isIndividual ? this.form.passportNo : true) &&
      this.form.division &&
      this.form.district  &&
      this.form.status  
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning(
        'Please fill in all required fields with valid values.',
      );
      return;
    }
    if (!this.tinId) {
      this.toast.error('Invalid TIN ID. Please go back and try again.');
      return;
    }

    this.isSaving = true;

    this.http
      .put(API_ENDPOINTS.TINS.UPDATE(this.tinId), this.form)
      .pipe(takeUntil(this.destroy$),
        finalize(() => {
          this.isSaving = false;
        }))
      .subscribe({
        next: () => {
          
          this.toast.success('TIN updated successfully!');
          setTimeout(() => this.router.navigate(['/tins']), 1500);
        },
        error: (error) => {
          console.error('Error updating TIN:', error);
          this.toast.error('Failed to update TIN. Please try again.');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/tin/view', this.tinId]);
  }
}
