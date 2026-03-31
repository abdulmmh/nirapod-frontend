import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email    = '';
  password = '';
  isLoading = false;
  errorMsg  = '';
  showPassword = false;

  // Quick-login demo accounts
  demoAccounts = [
    { label: 'Super Admin',          email: 'admin@vattax.gov.bd',        role: 'SUPER_ADMIN' },
    { label: 'Tax Commissioner',     email: 'commissioner@vattax.gov.bd', role: 'TAX_COMMISSIONER' },
    { label: 'Tax Officer',          email: 'officer@vattax.gov.bd',      role: 'TAX_OFFICER' },
    { label: 'Auditor',              email: 'auditor@vattax.gov.bd',      role: 'AUDITOR' },
    { label: 'Data Entry Operator',  email: 'operator@vattax.gov.bd',     role: 'DATA_ENTRY_OPERATOR' },
    { label: 'Taxpayer',             email: 'taxpayer@example.com',       role: 'TAXPAYER' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  fillDemo(email: string): void {
    this.email    = email;
    this.password = 'demo1234';
    this.errorMsg = '';
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter email and password.';
      return;
    }

    this.isLoading = true;
    this.errorMsg  = '';

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          this.isLoading = false;
          this.errorMsg  = 'Invalid email or password. Please try again.';
        }
      });
  }
}