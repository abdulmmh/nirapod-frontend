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

  // Quick-login demo accounts
  demoAccounts = [
    { label: 'Super Admin', email: 'admin@vattax.gov.bd', role: 'SUPER_ADMIN' },
    {
      label: 'Tax Commissioner',
      email: 'commissioner@vattax.gov.bd',
      role: 'TAX_COMMISSIONER',
    },
    {
      label: 'Tax Officer',
      email: 'officer@vattax.gov.bd',
      role: 'TAX_OFFICER',
    },
    { label: 'Auditor', email: 'auditor@vattax.gov.bd', role: 'AUDITOR' },
    {
      label: 'Data Entry Operator',
      email: 'operator@vattax.gov.bd',
      role: 'DATA_ENTRY_OPERATOR',
    },
    { label: 'Taxpayer', email: 'taxpayer@example.com', role: 'TAXPAYER' },
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
    this.password = 'demo1234';
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
        error: () => {
          this.isLoading = false;
          this.errorMsg = 'Invalid email or password. Please try again.';
          this.toast.error('Invalid email or password. Please try again.');
        },
      });
  }
}
