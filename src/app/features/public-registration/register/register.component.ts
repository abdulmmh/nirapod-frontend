import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import {
  AccountCategory,
  emptyState,
  RegistrationResponse,
  RegistrationState,
  UserRegistrationRequest,
} from '../../../models/registration.model';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { ToastService } from '../../../shared/toast/toast.service';
export type WizardStep = 1 | 2 | 3 | 4 | 5;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnDestroy {
  currentStep: WizardStep = 1;
  state: RegistrationState = emptyState();
  isSubmitting = false;
  registrationResponse: RegistrationResponse | null = null;

  private destroy$ = new Subject<void>();

  readonly steps = [
    { num: 1, label: 'Account Type', icon: 'bi-person-badge-fill' },
    { num: 2, label: 'Credentials', icon: 'bi-lock-fill' },
    { num: 3, label: 'Identity', icon: 'bi-credit-card-2-front-fill' },
    { num: 4, label: 'Review', icon: 'bi-clipboard-check-fill' },
  ];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Step event handlers ───────────────────────────────────────────────────

  onStep1Next(partial: Partial<RegistrationState>): void {
    this.state = { ...this.state, ...partial };
    this.currentStep = 2;
  }

  onStep2Next(partial: Partial<RegistrationState>): void {
    this.state = { ...this.state, ...partial };
    this.currentStep = 3;
  }

  onStep3Next(partial: Partial<RegistrationState>): void {
    this.state = { ...this.state, ...partial };
    this.currentStep = 4;
  }

  onBack(targetStep: WizardStep): void {
    this.currentStep = targetStep;
  }

  // ── Final submit ──────────────────────────────────────────────────────────

  onSubmit(): void {
    this.isSubmitting = true;

    const payload: UserRegistrationRequest = {
      taxpayerTypeId:  this.state.taxpayerTypeId!,      
      accountCategory: this.state.accountCategory!,

      fullName:  this.state.fullName,
      email:     this.state.email,
      phone:     this.state.phone,
      password:  this.state.password,

      ...(this.state.accountCategory === 'Individual' && {
        nid:         this.state.nid,
        dateOfBirth: this.state.dateOfBirth,
        gender:      this.state.gender,
        profession:  this.state.profession || undefined,
      }),

      ...((this.state.accountCategory === 'Business' ||
          this.state.accountCategory === 'Organization') && {
        companyName:          this.state.companyName,
        rjscNo:               this.state.rjscNo || undefined,  // Govt org-এ optional
        incorporationDate:    this.state.incorporationDate,
        natureOfBusiness:     this.state.natureOfBusiness || undefined,
        authorizedPersonName: this.state.authorizedPersonName,
        authorizedPersonNid:  this.state.authorizedPersonNid,
      }),
    };

    this.http
      .post<RegistrationResponse>(API_ENDPOINTS.AUTH.REGISTER, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: (response) => {
          this.registrationResponse = response;
          this.currentStep = 5; // show success screen
        },
        error: (err) => {
          // 409 (duplicate email/NID/RJSC) is caught by the global AuthInterceptor
          // and already shows a toast. Only handle 400 locally.
          if (err?.status === 400) {
            this.toast.error(
              err.error?.message ||
                'Invalid registration data. Please check all fields.',
            );
          }
        },
      });
  }
}
