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
  // ──────── Properties ──────────

  isLoading = true;
  isSaving = false;
  tinId: number | null = null;

  form: Partial<Tin> = {};

  private destroy$ = new Subject<void>();

  // ────────── Static Data ──────────────
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

  // ─────────  Getter ───────────────

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

  // ─────────── Constructor ──────────────

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  // ───────────── Lifecycle ──────────────────

  ngOnInit(): void {
    this.initializeTin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────── Initialization  ─────────────

  private initializeTin(): void {
    const id = this.getValidTinId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.tinId = id;
    this.fetchTin();
  }

  private fetchTin(): void {
    if (!this.tinId) return;

    this.isLoading = true;

    this.http
      .get<Tin>(API_ENDPOINTS.TINS.GET(this.tinId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Tin): void {
    this.form = { ...data };
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading business data:', error);
    this.toast.error('Failed to load TIN record. Please refresh or go back.');
  }

  // ─────────── Events  ────────────────
  onCancel(): void {
    this.router.navigate(['/tin/view', this.tinId]);
  }

  // ─────────── Validation  ────────────────

  private getValidTinId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid TIN ID. Please go back and try again.');
  }

  isFormValid(): boolean {
    return !!(
      this.form.taxpayerName &&
      this.form.tinCategory &&
      this.form.phone &&
      this.form.taxZone &&
      this.form.taxCircle &&
      this.form.issuedDate &&
      (this.isIndividual ? this.form.nid : true) &&
      (this.isIndividual ? this.form.passportNo : true) &&
      this.form.division &&
      this.form.district &&
      this.form.status
    );
  }

  // ───────── Actions  ─────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    }

    if (!this.tinId) {
      this.handleInvalidId();
      return;
    }

    this.isSaving = true;
    this.updateTin();
  }

  private updateTin(): void {
    this.http
      .put(API_ENDPOINTS.TINS.UPDATE(this.tinId!), this.form)
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
    this.toast.success('TIN record updated successfully!');
    setTimeout(() => this.router.navigate(['/tin']), 1500);
  }

  private handleUpdateError(error: unknown): void {
    console.error('Error updating TIN record:', error);
    this.toast.error('Failed to update TIN record. Please try again.');
  }

  private showValidationWarning(): void {
    this.toast.warning('Please fill in all required fields with valid values.');
  }
}
