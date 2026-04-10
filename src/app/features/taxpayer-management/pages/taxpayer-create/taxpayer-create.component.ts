import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { TaxpayerCreateRequest } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-taxpayer-create',
  templateUrl: './taxpayer-create.component.html',
  styleUrls: ['./taxpayer-create.component.css']
})
export class TaxpayerCreateComponent {

  // ──────────────────── State ───────────────────────

  isLoading  = false;
  
  form: TaxpayerCreateRequest = this.getEmptyForm();

  private destroy$ = new Subject<void>();

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


  private getEmptyForm(): TaxpayerCreateRequest {
    return {
      tin:              '',
      fullName:         '',
      email:            '',
      phone:            '',
      taxpayerType:     'Individual',
      status:           'Active', 
      registrationDate: new Date().toISOString().split('T')[0],
      address:          '',
      dateOfBirth:      '',
      nationalId:       ''
    };
  }


  // ─────────────────── Validation ───────────────────

  isFormValid(): boolean {
    const requiredFields = 
      !!this.form.tin          &&
      !!this.form.fullName     &&
      !!this.form.phone        &&
      !!this.form.taxpayerType &&
      !!this.form.nationalId   && 
      !!this.form.dateOfBirth  &&
      !!this.form.address     &&
      !!this.form.status      &&
      !!this.form.registrationDate;
    
      return requiredFields && this.isEmailValid();
  }
    
  isEmailValid(): boolean {
    if (!this.form.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }


  // ─────────────────── Actions ───────────────────

   onSubmit(): void {
     if (!this.isFormValid()) {
       this.showValidationWarning();
       return;
     }
 
     this.isLoading = true;
     this.createTaxpayer();
   }
 
   private createTaxpayer(): void {
     this.http
       .post(API_ENDPOINTS.TAXPAYERS.CREATE, this.form)
       .pipe(takeUntil(this.destroy$),
         finalize(() => this.isLoading = false))
       .subscribe({
         next: () => this.handleSuccess(),
         error: (error) => this.handleError(error),
       });
   }
 
   private handleSuccess(): void {
     this.toast.success('Taxpayer created successfully!');
     setTimeout(() => this.router.navigate(['/taxpayers']), 1500);
   }
 
   private handleError(error: unknown): void {
     console.error('Error creating taxpayer:', error);
     this.toast.error('Failed to create taxpayer. Please try again.');
   }
   
   private showValidationWarning(): void {
     this.toast.warning('Please fill in all required fields with valid values.');
   }
   
   onReset(): void {
     this.form = this.getEmptyForm();
     this.toast.info('Form has been reset.');
   }
  onCancel(): void {
    this.router.navigate(['/taxpayers']);
  }
}