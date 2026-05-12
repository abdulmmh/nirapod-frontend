import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from 'src/app/models/taxpayer.model';

@Component({
  selector: 'app-portal-application-status',
  templateUrl: './portal-application-status.component.html',
  styleUrls: ['./portal-application-status.component.css']
})
export class PortalApplicationStatusComponent implements OnInit {

  taxpayer: Taxpayer | null = null;
  isLoading = true;

  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user?.taxpayerId) {
      this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(user.taxpayerId))
        .subscribe({
          next: (data) => { this.taxpayer = data; this.isLoading = false; },
          error: () => { this.isLoading = false; }
        });
    } else {
      this.isLoading = false;
    }
  }

  get approvalStatus(): string {
    return this.taxpayer?.approvalStatus || 
           this.authService.currentUser?.approvalStatus || '';
  }

  get isPending(): boolean { return this.approvalStatus === 'PENDING_REVIEW'; }
  get isRejected(): boolean { return this.approvalStatus === 'REJECTED'; }

  get displayName(): string {
    return this.taxpayer?.fullName 
      || this.taxpayer?.companyName 
      || this.authService.currentUser?.fullName 
      || '';
  }

  get reviewNotes(): string {
    return this.taxpayer?.reviewNotes || '';
  }

  logout(): void {
    this.authService.logout();
  }
}
