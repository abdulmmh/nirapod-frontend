import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Business } from '../../../../models/business.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-business-view',
  templateUrl: './business-view.component.html',
  styleUrls: ['./business-view.component.css']
})
export class BusinessViewComponent implements OnInit {

  business: Business | null = null;
  isLoading = true;

  private fallback: Business[] = [
    { id: 1, businessRegNo: 'BRN-2024-00001', businessName: 'Rahman Textile Ltd.', tinNumber: 'TIN-1001', ownerName: 'Abdul Rahman', businessType: 'Private Limited', businessCategory: 'Manufacturing', tradeLicenseNo: 'TL-44821', binNo: 'BIN-2024-001', incorporationDate: '2015-06-01', registrationDate: '2024-01-10', expiryDate: '2025-01-10', email: 'rahman@textile.com', phone: '01711-111111', address: 'Mirpur DOHS, Dhaka', district: 'Dhaka', division: 'Dhaka', annualTurnover: 5000000, numberOfEmployees: 120, status: 'Active', remarks: '' },
    { id: 2, businessRegNo: 'BRN-2024-00002', businessName: 'Karim Traders', tinNumber: 'TIN-1002', ownerName: 'Karim Uddin', businessType: 'Sole Proprietorship', businessCategory: 'Trading', tradeLicenseNo: 'TL-55932', binNo: 'BIN-2024-002', incorporationDate: '2018-03-15', registrationDate: '2024-01-15', expiryDate: '2025-01-15', email: 'karim@traders.com', phone: '01822-222222', address: 'Gulshan-1, Dhaka', district: 'Dhaka', division: 'Dhaka', annualTurnover: 1200000, numberOfEmployees: 15, status: 'Active', remarks: '' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Business>(API_ENDPOINTS.BUSINESSES.GET(id)).subscribe({
          next: data => { this.business = data; this.isLoading = false; },
          error: ()  => {
    this.business = this.fallback.find(b => b.id === id) || this.fallback[0];
    this.isLoading = false;
      }
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended',
      'Dissolved': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Manufacturing': 'bi bi-gear-fill', 'Trading': 'bi bi-bag-fill',
      'Service': 'bi bi-briefcase-fill', 'Agriculture': 'bi bi-tree-fill',
      'Construction': 'bi bi-building-fill', 'IT': 'bi bi-laptop-fill',
      'Healthcare': 'bi bi-heart-pulse-fill', 'Education': 'bi bi-book-fill',
      'Other': 'bi bi-grid-fill'
    };
    return map[c] ?? 'bi bi-grid-fill';
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatCurrency(a: number): string { return `৳${a.toLocaleString()}`; }

  onEdit(): void { this.router.navigate(['/businesses/edit', this.business?.id]); }
  onBack(): void { this.router.navigate(['/businesses']); }
}