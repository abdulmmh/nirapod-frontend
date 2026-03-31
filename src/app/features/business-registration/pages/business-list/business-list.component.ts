import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Business } from '../../../../models/business.model';

@Component({
  selector: 'app-business-list',
  templateUrl: './business-list.component.html',
  styleUrls: ['./business-list.component.css']
})
export class BusinessListComponent implements OnInit {

  businesses: Business[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: Business[] = [
    {
      id: 1, businessRegNo: 'BRN-2024-00001',
      businessName: 'Rahman Textile Ltd.',
      tinNumber: 'TIN-1001', ownerName: 'Abdul Rahman',
      businessType: 'Private Limited', businessCategory: 'Manufacturing',
      tradeLicenseNo: 'TL-44821', binNo: 'BIN-2024-001',
      incorporationDate: '2015-06-01', registrationDate: '2024-01-10',
      expiryDate: '2025-01-10', email: 'rahman@textile.com',
      phone: '01711-111111', address: 'Mirpur DOHS, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      annualTurnover: 5000000, numberOfEmployees: 120,
      status: 'Active', remarks: ''
    },
    {
      id: 2, businessRegNo: 'BRN-2024-00002',
      businessName: 'Karim Traders',
      tinNumber: 'TIN-1002', ownerName: 'Karim Uddin',
      businessType: 'Sole Proprietorship', businessCategory: 'Trading',
      tradeLicenseNo: 'TL-55932', binNo: 'BIN-2024-002',
      incorporationDate: '2018-03-15', registrationDate: '2024-01-15',
      expiryDate: '2025-01-15', email: 'karim@traders.com',
      phone: '01822-222222', address: 'Gulshan-1, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      annualTurnover: 1200000, numberOfEmployees: 15,
      status: 'Active', remarks: ''
    },
    {
      id: 3, businessRegNo: 'BRN-2024-00003',
      businessName: 'Dhaka Pharma Co.',
      tinNumber: 'TIN-1003', ownerName: 'Dr. Nasrin Islam',
      businessType: 'Private Limited', businessCategory: 'Healthcare',
      tradeLicenseNo: 'TL-66743', binNo: 'BIN-2024-003',
      incorporationDate: '2010-01-20', registrationDate: '2024-02-01',
      expiryDate: '2024-12-31', email: 'info@dhakpharma.com',
      phone: '01933-333333', address: 'Dhanmondi, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      annualTurnover: 15000000, numberOfEmployees: 250,
      status: 'Pending', remarks: 'License renewal pending'
    },
    {
      id: 4, businessRegNo: 'BRN-2024-00004',
      businessName: 'Chittagong Exports',
      tinNumber: 'TIN-1004', ownerName: 'Faruk Hossain',
      businessType: 'Partnership', businessCategory: 'Trading',
      tradeLicenseNo: 'TL-77854', binNo: 'BIN-2024-004',
      incorporationDate: '2012-09-10', registrationDate: '2024-02-10',
      expiryDate: '2025-02-10', email: 'ctg@exports.com',
      phone: '01544-444444', address: 'Agrabad, Chittagong',
      district: 'Chittagong', division: 'Chittagong',
      annualTurnover: 8000000, numberOfEmployees: 85,
      status: 'Active', remarks: ''
    },
    {
      id: 5, businessRegNo: 'BRN-2024-00005',
      businessName: 'Sylhet Tea House',
      tinNumber: 'TIN-1005', ownerName: 'Rahim Ali',
      businessType: 'Sole Proprietorship', businessCategory: 'Agriculture',
      tradeLicenseNo: 'TL-88965', binNo: 'BIN-2024-005',
      incorporationDate: '2008-04-05', registrationDate: '2024-03-01',
      expiryDate: '2024-06-30', email: 'sylhet@teahouse.com',
      phone: '01655-555555', address: 'Sylhet Sadar, Sylhet',
      district: 'Sylhet', division: 'Sylhet',
      annualTurnover: 3500000, numberOfEmployees: 45,
      status: 'Suspended', remarks: 'Compliance issue'
    },
    {
      id: 6, businessRegNo: 'BRN-2024-00006',
      businessName: 'BD Tech Solutions',
      tinNumber: 'TIN-1006', ownerName: 'Imran Ahmed',
      businessType: 'Private Limited', businessCategory: 'IT',
      tradeLicenseNo: 'TL-99076', binNo: 'BIN-2024-006',
      incorporationDate: '2019-11-15', registrationDate: '2024-03-10',
      expiryDate: '2025-03-10', email: 'info@bdtech.com',
      phone: '01766-666666', address: 'Banani, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      annualTurnover: 6500000, numberOfEmployees: 60,
      status: 'Active', remarks: ''
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Business[]>(API_ENDPOINTS.TAXPAYERS.LIST).subscribe({
      next: data => { this.businesses = data;           this.isLoading = false; },
      error: ()   => { this.businesses = this.fallback; this.isLoading = false; }
    });
  }

  get filteredBusinesses(): Business[] {
    if (!this.searchTerm.trim()) return this.businesses;
    const term = this.searchTerm.toLowerCase();
    return this.businesses.filter(b =>
      b.businessName.toLowerCase().includes(term)   ||
      b.businessRegNo.toLowerCase().includes(term)  ||
      b.tinNumber.toLowerCase().includes(term)      ||
      b.ownerName.toLowerCase().includes(term)      ||
      b.businessType.toLowerCase().includes(term)   ||
      b.district.toLowerCase().includes(term)
    );
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended',
      'Dissolved': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getTypeClass(t: string): string {
    const map: Record<string, string> = {
      'Sole Proprietorship': 'type-sole',
      'Partnership':         'type-partner',
      'Private Limited':     'type-pvt',
      'Public Limited':      'type-pub',
      'NGO':                 'type-ngo',
      'Other':               'type-other'
    };
    return map[t] ?? '';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Manufacturing': 'bi bi-gear-fill',
      'Trading':       'bi bi-bag-fill',
      'Service':       'bi bi-briefcase-fill',
      'Agriculture':   'bi bi-tree-fill',
      'Construction':  'bi bi-building-fill',
      'IT':            'bi bi-laptop-fill',
      'Healthcare':    'bi bi-heart-pulse-fill',
      'Education':     'bi bi-book-fill',
      'Other':         'bi bi-grid-fill'
    };
    return map[c] ?? 'bi bi-grid-fill';
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }

  view(id: number): void { this.router.navigate(['/businesses/view', id]); }
  edit(id: number): void { this.router.navigate(['/businesses/edit', id]); }

  delete(id: number): void {
    if (!confirm('Delete this business?')) return;
    this.businesses = this.businesses.filter(b => b.id !== id);
  }

  isExpired(date: string): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
  }
}