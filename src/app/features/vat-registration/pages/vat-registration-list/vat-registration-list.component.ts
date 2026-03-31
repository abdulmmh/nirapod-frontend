import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistration } from '../../../../models/vat-registration.model';

@Component({
  selector: 'app-vat-registration-list',
  templateUrl: './vat-registration-list.component.html',
  styleUrls: ['./vat-registration-list.component.css']
})
export class VatRegistrationListComponent implements OnInit {

  vatRegistrations: VatRegistration[] = [];
  searchTerm = '';
  isLoading  = false;

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
    {
      id: 3, binNo: 'BIN-2024-001003',
      tinNumber: 'TIN-1003', businessName: 'Dhaka Pharma Co.',
      ownerName: 'Dr. Nasrin Islam', vatCategory: 'Exempt',
      businessType: 'Private Limited', businessCategory: 'Healthcare',
      tradeLicenseNo: 'TL-66743',
      registrationDate: '2024-02-01', effectiveDate: '2024-02-05',
      expiryDate: '2024-12-31', annualTurnover: 15000000,
      email: 'info@dhakpharma.com', phone: '01933-333333',
      address: 'Dhanmondi, Dhaka', district: 'Dhaka', division: 'Dhaka',
      vatZone: 'VAT Zone-1', vatCircle: 'Circle-2',
      status: 'Pending', remarks: 'Exemption under review'
    },
    {
      id: 4, binNo: 'BIN-2024-001004',
      tinNumber: 'TIN-1004', businessName: 'Chittagong Exports',
      ownerName: 'Faruk Hossain', vatCategory: 'Zero Rated',
      businessType: 'Partnership', businessCategory: 'Trading',
      tradeLicenseNo: 'TL-77854',
      registrationDate: '2024-02-10', effectiveDate: '2024-02-15',
      expiryDate: '2025-02-15', annualTurnover: 8000000,
      email: 'ctg@exports.com', phone: '01544-444444',
      address: 'Agrabad, Chittagong', district: 'Chittagong', division: 'Chittagong',
      vatZone: 'VAT Zone-3', vatCircle: 'Circle-1',
      status: 'Active', remarks: ''
    },
    {
      id: 5, binNo: 'BIN-2024-001005',
      tinNumber: 'TIN-1005', businessName: 'Sylhet Tea House',
      ownerName: 'Rahim Ali', vatCategory: 'Standard',
      businessType: 'Sole Proprietorship', businessCategory: 'Agriculture',
      tradeLicenseNo: 'TL-88965',
      registrationDate: '2024-03-01', effectiveDate: '2024-03-05',
      expiryDate: '2024-09-30', annualTurnover: 3500000,
      email: 'sylhet@teahouse.com', phone: '01655-555555',
      address: 'Sylhet Sadar, Sylhet', district: 'Sylhet', division: 'Sylhet',
      vatZone: 'VAT Zone-4', vatCircle: 'Circle-2',
      status: 'Suspended', remarks: 'Non-compliance'
    },
    {
      id: 6, binNo: 'BIN-2024-001006',
      tinNumber: 'TIN-1006', businessName: 'BD Tech Solutions',
      ownerName: 'Imran Ahmed', vatCategory: 'Special',
      businessType: 'Private Limited', businessCategory: 'IT',
      tradeLicenseNo: 'TL-99076',
      registrationDate: '2024-03-10', effectiveDate: '2024-03-15',
      expiryDate: '2025-03-15', annualTurnover: 6500000,
      email: 'info@bdtech.com', phone: '01766-666666',
      address: 'Banani, Dhaka', district: 'Dhaka', division: 'Dhaka',
      vatZone: 'VAT Zone-2', vatCircle: 'Circle-4',
      status: 'Active', remarks: ''
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<VatRegistration[]>(API_ENDPOINTS.TAXPAYERS.LIST).subscribe({
      next: data => { this.vatRegistrations = data;           this.isLoading = false; },
      error: ()   => { this.vatRegistrations = this.fallback; this.isLoading = false; }
    });
  }

  get filtered(): VatRegistration[] {
    if (!this.searchTerm.trim()) return this.vatRegistrations;
    const term = this.searchTerm.toLowerCase();
    return this.vatRegistrations.filter(v =>
      v.binNo.toLowerCase().includes(term)          ||
      v.businessName.toLowerCase().includes(term)   ||
      v.tinNumber.toLowerCase().includes(term)      ||
      v.ownerName.toLowerCase().includes(term)      ||
      v.vatCategory.toLowerCase().includes(term)    ||
      v.district.toLowerCase().includes(term)
    );
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

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }

  view(id: number): void { this.router.navigate(['/vat-registration/view', id]); }
  edit(id: number): void { this.router.navigate(['/vat-registration/edit', id]); }

  delete(id: number): void {
    if (!confirm('Delete this VAT registration?')) return;
    this.vatRegistrations = this.vatRegistrations.filter(v => v.id !== id);
  }
}