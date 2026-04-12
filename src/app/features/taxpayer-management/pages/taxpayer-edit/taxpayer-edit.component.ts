import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer, TaxpayerType } from '../../../../models/taxpayer.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MasterDataService } from 'src/app/core/services/master-data.service';

@Component({
  selector: 'app-taxpayer-edit',
  templateUrl: './taxpayer-edit.component.html',
  styleUrls: ['./taxpayer-edit.component.css'],
})
export class TaxpayerEditComponent implements OnInit {
  // ─────────────────── Properties ───────────────────

  isLoading = true;
  isSaving = false;
  taxpayerId: number | null = null;

  form: Partial<Taxpayer> = {};
  taxpayerTypes: TaxpayerType[] = [];

  private destroy$ = new Subject<void>();

  // ─────────────────── Static Data ───────────────────

  statuses = ['Active', 'Inactive', 'Pending', 'Suspended'];

  // ─────────────────── Constructor ───────────────────
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private masterData: MasterDataService
  ) {}

  // ───────────── Lifecycle ──────────────────

  ngOnInit(): void {
    this.initializeTaxpayerTypes();
    this.initializeTaxpayer();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────── Initialization  ─────────────

  private initializeTaxpayer(): void {
    const id = this.getValidTaxpayerId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.taxpayerId = id;
    this.fetchTaxpayer();
  }

  private initializeTaxpayerTypes(): void {
    this.masterData.getTaxpayerTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.taxpayerTypes = data;
          if (data.length > 0) {
            this.form.taxpayerType = data[0];
          }
        },
        error: () => this.toast.error('Failed to load taxpayer types.')
      });
  }

  // ───────────  Data Fetching ───────────────

  private fetchTaxpayer(): void {
    if (!this.taxpayerId) return;

    this.isLoading = true;

    this.http
      .get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(this.taxpayerId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Taxpayer): void {
    this.form = { ...data };
    const matchedType = this.taxpayerTypes.find(
      t => t.id === data.taxpayerType?.id
    );

    if (matchedType) {
      this.form.taxpayerType = matchedType;
    }
  }

  private handleFetchError(error: unknown): void {
    console.error('Error loading taxpayer data:', error);
    this.toast.error(
      'Failed to load taxpayer data. Please refresh or go back.',
    );
  }

  // ─────────── Validation ───────────────

  isFormValid(): boolean {
    const requiredFields = !!(
      this.form.tinNumber &&
      this.form.fullName &&
      this.form.email &&
      this.form.phone &&
      this.form.taxpayerType &&
      this.form.nid &&
      this.form.dateOfBirth &&
      this.form.address &&
      this.form.status
    );

    return requiredFields && this.isEmailValid();
  }

  isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

  private getValidTaxpayerId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid taxpayer ID. Please go back and try again.');
  }

  // ─────────── Actions  ────────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    }

    if (!this.taxpayerId) {
      this.handleInvalidId();
      return;
    }

    this.isSaving = true;
    this.updateTaxpayer();
  }

  private updateTaxpayer(): void {
    this.isSaving = true;

    this.http
      .put(API_ENDPOINTS.TAXPAYERS.UPDATE(this.taxpayerId!), this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleUpdateSuccess(),
        error: () => this.handleUpdateError(),
      });
  }

  private handleUpdateSuccess(): void {
    this.isSaving = false;
    this.toast.success('Taxpayer updated successfully!');
    this.router.navigate(['/taxpayers', 'view', this.taxpayerId]);
  }

  private handleUpdateError(): void {
    this.isSaving = false;
    this.toast.error('Failed to update taxpayer. Please try again.');
  }

  private showValidationWarning(): void {
    this.toast.warning('Please fill in all required fields correctly.');
  }

  onCancel(): void {
    this.router.navigate(['/taxpayers', 'view', this.taxpayerId]);
  }
}
