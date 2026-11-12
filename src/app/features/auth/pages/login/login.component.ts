import { environment } from '../../../../../environments/environment';
import { Component } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from 'src/app/core/constants/roles.constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMsg = '';
  showPassword = false;

  demoMode = window.nirapodConfig?.demoMode ?? environment.production;
  demoPassword = window.nirapodConfig?.demoPassword || '';
  demoAccounts = [
    { label: 'Officer', email: 'officer@nirapod.example' },
    { label: 'Taxpayer One', email: 'taxpayer@nirapod.example' },
    { label: 'Taxpayer Two', email: 'taxpayer2@nirapod.example' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {
    if (this.authService.isLoggedIn) {
      const role = this.authService.userRole;
      if (role === Role.TAXPAYER) {
        this.router.navigate(['/my-portal']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  fillDemo(email: string): void {
    this.email = email;
    this.password = this.demoPassword;
    this.errorMsg = '';
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter email and password.';
      this.toast.error('Please enter email and password.');
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          const role = this.authService.userRole;
          if (role === Role.TAXPAYER) {
            this.router.navigate(['/my-portal']);
          } else {
            this.router.navigate(['/dashboard']);
          }

          // const returnUrl =
          //   this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          // this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.isLoading = false;
          if (err?.error?.requiresVerification) {
            this.toast.warning('Please verify your email first.');
            this.router.navigate(['/auth/verify-otp'], {
              queryParams: { email: err.error.email }
            });
          } else {
            this.toast.error(err?.error?.message || 'Login failed.');
          }
        },
      });
  }
}
