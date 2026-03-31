import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VatRegistration } from '../../../../models/vat-registration.model';

@Component({
  selector: 'app-vat-registration-view',
  templateUrl: './vat-registration-view.component.html',
  styleUrls: ['./vat-registration-view.component.css']
})
export class VatRegistrationViewComponent implements OnInit {

  vat: VatRegistration | null = null;
  isLoading = true;

  private fallback: VatRegistration[] = [
    {
      id: 1, binNo: 'BIN-2024-001001',
      tinNumber: 'TIN-1001', businessName: 'Rahman Textile Ltd.',
      ownerName: 'Abdul Rahman', vatCategory: 'Standard',
      businessType: 'Private Limited', businessCategory: 'Manufacturing',
      tradeLicenseNo: 'TL-44821',
      registrationDate: '2024-01-10', effectiveDate: '2024-01-15',
      expiryDate: '2025-01-15', annualTurnover: 5000000,
      email: 'rahman@textile.com', phone: '01711-111111',
      address: 'Mirpur DOHS, Dhaka', district: 'Dhaka', division: 'Dhaka',
      vatZone: 'VAT Zone-1', vatCircle: 'Circle-5',
      status: 'Active', remarks: ''
    },
    {
      id: 2, binNo: 'BIN-2024-001002',
      tinNumber: 'TIN-1002', businessName: 'Karim Traders',
      ownerName: 'Karim Uddin', vatCategory: 'Standard',
      businessType: 'Sole Proprietorship', businessCategory: 'Trading',
      tradeLicenseNo: 'TL-55932',
      registrationDate: '2024-01-15', effectiveDate: '2024-01-20',
      expiryDate: '2025-01-20', annualTurnover: 1200000,
      email: 'karim@traders.com', phone: '01822-222222',
      address: 'Gulshan-1, Dhaka', district: 'Dhaka', division: 'Dhaka',
      vatZone: 'VAT Zone-2', vatCircle: 'Circle-3',
      status: 'Active', remarks: ''
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.vat = this.fallback.find(v => v.id === id) || this.fallback[0];
    this.isLoading = false;
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended',
      'Cancelled': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      'Standard':   'cat-standard',
      'Zero Rated': 'cat-zero',
      'Exempt':     'cat-exempt',
      'Special':    'cat-special'
    };
    return map[c] ?? '';
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatCurrency(a: number): string { return `৳${a.toLocaleString()}`; }
  onEdit(): void { this.router.navigate(['/vat-registration/edit', this.vat?.id]); }
  onBack(): void { this.router.navigate(['/vat-registration']); }
}