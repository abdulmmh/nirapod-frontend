import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../shared/toast/toast.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  email = '';
  otp = '';
  isLoading = false;
  isResending = false;
  countdown = 60;
  canResend = false;
  private timer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private startCountdown(): void {
    this.countdown = 60;
    this.canResend = false;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.canResend = true;
        clearInterval(this.timer);
      }
    }, 1000);
  }

  onVerify(): void {
    if (this.otp.length !== 6) {
      this.toast.warning('Please enter the 6-digit OTP.');
      return;
    }

    this.isLoading = true;
    this.http.post<any>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      email: this.email,
      otp: this.otp
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success('Email verified successfully!');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'Invalid OTP. Please try again.');
      }
    });
  }

  onResend(): void {
    if (!this.canResend) return;
    this.isResending = true;
    this.http.post<any>(API_ENDPOINTS.AUTH.RESEND_OTP, { email: this.email })
      .subscribe({
        next: () => {
          this.isResending = false;
          this.otp = '';
          this.toast.success('New OTP sent to your email.');
          this.startCountdown();
        },
        error: () => {
          this.isResending = false;
          this.toast.error('Failed to resend OTP.');
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}