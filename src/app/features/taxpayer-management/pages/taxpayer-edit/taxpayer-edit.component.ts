import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-taxpayer-edit',
  templateUrl: './taxpayer-edit.component.html',
  styleUrls: ['./taxpayer-edit.component.css']
})
export class TaxpayerEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  taxpayerId : number | null = null;

  statuses       = ['Active', 'Inactive', 'Pending', 'Suspended'];
  taxpayerTypes  = ['Individual', 'Business', 'Company'];

  form: Partial<Taxpayer> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const rawId   = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.toast.error('Invalid taxpayer ID. Please go back and try again.');
      return;
    }

    this.taxpayerId = parsedId;
    this.loadTaxpayer();
  }

  loadTaxpayer(): void {
    this.isLoading = true;
    this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(this.taxpayerId!))
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: data => {
              this.form      = { ...data };
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
              this.toast.error('Failed to load taxpayer data. Please refresh or go back.');
            }
          });
  }

  isFormValid(): boolean {
    const requiredFields =
      !!(this.form.tin            && 
        this.form.fullName        && 
        this.form.email           && 
        this.form.phone           && 
        this.form.taxpayerType    && 
        this.form.nationalId      && 
        this.form.dateOfBirth     && 
        this.form.address         && 
        this.form.status);

    return requiredFields && this.isEmailValid();
  }

  isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

   onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields with valid values.');
      return;
    }

    this.isSaving = true;

    this.http.put(API_ENDPOINTS.TAXPAYERS.UPDATE(this.taxpayerId!), this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toast.success('Taxpayer updated successfully!');
          setTimeout(() => this.router.navigate(['/taxpayers']), 1500);
        },
        error: () => {
          this.isSaving = false;
          this.toast.error('Failed to update taxpayer. Please try again.');
        }
    });
  }

  onCancel(): void { this.router.navigate(['/taxpayers', 'view', this.taxpayerId]); }
}