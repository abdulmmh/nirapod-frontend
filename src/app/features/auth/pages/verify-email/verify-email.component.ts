import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  success = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.isLoading = false;
      this.message = 'Invalid verification link.';
      return;
    }

    this.http.get<any>(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`)
      .subscribe({
        next: (res) => {
          this.success = true;
          this.message = res.message || 'Your email has been verified successfully.';
          this.isLoading = false;
        },
        error: (err) => {
          this.success = false;
          this.message = err?.error?.message || 'Verification failed or link has expired.';
          this.isLoading = false;
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
