import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from 'src/app/models/taxpayer.model';

@Component({
  selector: 'app-portal-home',
  templateUrl: './portal-home.component.html',
  styleUrls: ['./portal-home.component.css']
})
export class PortalHomeComponent implements OnInit {

  taxpayer: Taxpayer | null = null;
  isLoading = true;

  menuItems: { label: string; route: string; icon: string }[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

ngOnInit(): void {
  const user = this.authService.currentUser;
  if (user?.taxpayerId) {
    this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(user.taxpayerId))
      .subscribe({
        next: (data) => {
          this.taxpayer = data;
          this.buildMenu(data.taxpayerType?.category ?? '');
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  } else {
    this.isLoading = false;
  }
}

private buildMenu(category: string): void {
  if (category === 'Individual') {
    this.menuItems = [
      { label: 'My TIN',            route: '/tins',               icon: '🪪' },
      { label: 'Income Tax Return', route: '/income-tax-returns',   icon: '📋' },
      { label: 'AIT',               route: '/aits',                  icon: '📊' },
      { label: 'Payments',          route: '/payments',             icon: '💳' },
      { label: 'Notices',           route: '/notices',              icon: '🔔' },
    ];
  } else if (category === 'Business') {
    this.menuItems = [
      { label: 'My TIN',           route: '/tins',             icon: '🪪' },
      { label: 'VAT Registration', route: '/vat-registrations',   icon: '🏢' },
      { label: 'VAT Returns',      route: '/vat-returns',        icon: '📋' },
      { label: 'Payments',         route: '/payments',           icon: '💳' },
      { label: 'Notices',          route: '/notices',            icon: '🔔' },
    ];
  } else if (category === 'Organization') {
    this.menuItems = [
      { label: 'My TIN',            route: '/tins',             icon: '🪪' },
      { label: 'Income Tax Return', route: '/income-tax-returns', icon: '📋' },
      { label: 'Documents',         route: '/documents',          icon: '📁' },
      { label: 'Payments',          route: '/payments',           icon: '💳' },
      { label: 'Notices',           route: '/notices',            icon: '🔔' },
    ];
  }
}

  get displayName(): string {
    return this.taxpayer?.fullName 
      || this.taxpayer?.companyName 
      || this.authService.currentUser?.fullName 
      || '';
  }

  get taxpayerTypeName(): string {
    return this.taxpayer?.taxpayerType?.typeName 
      || this.authService.currentUser?.taxpayerType 
      || '';
  }

  logout(): void {
    this.authService.logout();
  }
}
