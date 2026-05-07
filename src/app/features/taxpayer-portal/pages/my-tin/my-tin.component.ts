import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Tin } from '../../../../models/tin.model';

@Component({
  selector: 'app-my-tin',
  templateUrl: './my-tin.component.html',
  styleUrls: ['./my-tin.component.css']
})
export class MyTinComponent implements OnInit {

  tin: Tin | null = null;
  isLoading = true;
  error = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const taxpayerId = this.authService.currentUser?.taxpayerId;
    if (!taxpayerId) {
      this.error = 'Taxpayer ID not found.';
      this.isLoading = false;
      return;
    }

    this.http.get<Tin>(API_ENDPOINTS.TINS.BY_TAXPAYER(taxpayerId))
      .subscribe({
        next: (data) => {
          this.tin = data;
          this.isLoading = false;
        },
        error: () => {
          this.error = 'No TIN found for your account.';
          this.isLoading = false;
        }
      });
  }

  downloadCertificate(): void {
    if (!this.tin?.id) return;
    window.open(API_ENDPOINTS.TINS.DOWNLOAD_CERT(this.tin.id), '_blank');
  }
}