import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TaxpayerCreateRequest, TaxpayerType } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { MasterDataService } from 'src/app/core/services/master-data.service';

@Component({
  selector: 'app-taxpayer-create',
  templateUrl: './taxpayer-create.component.html',
  styleUrls: ['./taxpayer-create.component.css'],
})
export class TaxpayerCreateComponent implements OnInit, OnDestroy {

  isLoading = false;

  form: TaxpayerCreateRequest = this.getEmptyForm();
  taxpayerTypes: TaxpayerType[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private masterData: MasterDataService
  ) {}

  // ───────────── Lifecycle ─────────────

  ngOnInit(): void {
    this.loadTaxpayerTypes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTaxpayerTypes(): void {
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

  // ───────────── Form Factory ─────────────

  private getEmptyForm(): TaxpayerCreateRequest {
    return {
      tinNumber: '',
      fullName: '',
      email: '',
      phone: '',
      taxpayerType: {} as TaxpayerType,
      status: 'Active',
      registrationDate: new Date().toISOString().split('T')[0],
      address: '',
      dateOfBirth: '',
      nid: '',
    };
  }

  // ───────────── Validation ─────────────

  isFormValid(): boolean {
    return (
      !!this.form.tinNumber &&
      !!this.form.fullName &&
      !!this.form.phone &&
      !!this.form.taxpayerType?.id &&
      !!this.form.nid &&
      !!this.form.dateOfBirth &&
      !!this.form.address &&
      !!this.form.status &&
      !!this.form.registrationDate &&
      this.isEmailValid()
    );
  }

  isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

  // ───────────── Actions ─────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    this.createTaxpayer();
  }

  private createTaxpayer(): void {
    const payload = {
      ...this.form,
      taxpayerType: {
        id: this.form.taxpayerType.id
      }
    };

    this.http.post(API_ENDPOINTS.TAXPAYERS.CREATE, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.toast.success('Taxpayer created successfully!');
          setTimeout(() => this.router.navigate(['/taxpayers']), 1500);
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Failed to create taxpayer.');
        }
      });
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.toast.info('Form reset.');
  }

  onCancel(): void {
    this.router.navigate(['/taxpayers']);
  }
}