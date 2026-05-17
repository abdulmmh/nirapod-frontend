import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  token = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  success = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.toast.error('Invalid reset link.');
      this.router.navigate(['/auth/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.toast.warning('Passwords do not match.');
      return;
    }
    if (this.password.length < 8) {
      this.toast.warning('Password must be at least 8 characters.');
      return;
    }

    this.isLoading = true;
    this.http.post<any>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token:    this.token,
      password: this.password
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.success = true;
        this.isLoading = false;
        this.toast.success('Password reset successfully!');
        timer(2000).pipe(takeUntil(this.destroy$))
          .subscribe(() => this.router.navigate(['/auth/login']));
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Reset failed. Link may have expired.');
        this.isLoading = false;
      }
    });
  }
}
