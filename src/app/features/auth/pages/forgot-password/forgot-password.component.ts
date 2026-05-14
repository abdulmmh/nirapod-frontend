import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { ToastService } from '../../../../shared/toast/toast.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  sent = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  onSubmit(): void {
    if (!this.email.trim()) {
      this.toast.warning('Please enter your email address.');
      return;
    }

    this.isLoading = true;
    this.http.post<any>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: this.email })
      .subscribe({
        next: () => {
          this.sent = true;
          this.isLoading = false;
        },
        error: () => {
          this.toast.error('Something went wrong. Please try again.');
          this.isLoading = false;
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}