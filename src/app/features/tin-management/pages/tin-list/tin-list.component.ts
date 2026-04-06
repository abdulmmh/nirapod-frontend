import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Tin } from '../../../../models/tin.model';

@Component({
  selector: 'app-tin-list',
  templateUrl: './tin-list.component.html',
  styleUrls: ['./tin-list.component.css']
})
export class TinListComponent implements OnInit {

  tins: Tin[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: Tin[] = [
    {
      id: 1, tinNumber: 'TIN-2024-001001',
      taxpayerName: 'Abdul Karim',
      tinCategory: 'Individual', nationalId: '1234567890123',
      passportNo: '', dateOfBirth: '1985-03-15',
      incorporationDate: '', email: 'abdul.karim@example.com',
      phone: '01711-111111', address: 'Mirpur, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      taxZone: 'Zone-1', taxCircle: 'Circle-5',
      issuedDate: '2024-01-10', lastUpdated: '2024-01-10',
      status: 'Active', remarks: ''
    },
    {
      id: 2, tinNumber: 'TIN-2024-001002',
      taxpayerName: 'Rahman Textile Ltd.',
      tinCategory: 'Company', nationalId: '',
      passportNo: '', dateOfBirth: '',
      incorporationDate: '2015-06-01', email: 'rahman@textile.com',
      phone: '01711-222222', address: 'Mirpur DOHS, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      taxZone: 'Zone-2', taxCircle: 'Circle-3',
      issuedDate: '2024-01-15', lastUpdated: '2024-01-15',
      status: 'Active', remarks: ''
    },
    {
      id: 3, tinNumber: 'TIN-2024-001003',
      taxpayerName: 'Nusrat Jahan',
      tinCategory: 'Individual', nationalId: '9876543210123',
      passportNo: 'BD1234567', dateOfBirth: '1990-07-22',
      incorporationDate: '', email: 'nusrat@example.com',
      phone: '01822-333333', address: 'Gulshan, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      taxZone: 'Zone-3', taxCircle: 'Circle-7',
      issuedDate: '2024-02-01', lastUpdated: '2024-02-01',
      status: 'Active', remarks: ''
    },
    {
      id: 4, tinNumber: 'TIN-2024-001004',
      taxpayerName: 'Dhaka Pharma Co.',
      tinCategory: 'Company', nationalId: '',
      passportNo: '', dateOfBirth: '',
      incorporationDate: '2010-01-20', email: 'info@dhakpharma.com',
      phone: '01933-444444', address: 'Dhanmondi, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      taxZone: 'Zone-1', taxCircle: 'Circle-2',
      issuedDate: '2024-02-10', lastUpdated: '2024-02-10',
      status: 'Pending', remarks: 'Verification pending'
    },
    {
      id: 5, tinNumber: 'TIN-2024-001005',
      taxpayerName: 'Rahim Ali',
      tinCategory: 'Individual', nationalId: '1122334455667',
      passportNo: '', dateOfBirth: '1978-11-05',
      incorporationDate: '', email: 'rahim@example.com',
      phone: '01655-555555', address: 'Sylhet Sadar, Sylhet',
      district: 'Sylhet', division: 'Sylhet',
      taxZone: 'Zone-4', taxCircle: 'Circle-1',
      issuedDate: '2024-03-01', lastUpdated: '2024-03-01',
      status: 'Suspended', remarks: 'Non-compliance'
    },
    {
      id: 6, tinNumber: 'TIN-2024-001006',
      taxpayerName: 'BD Tech Solutions',
      tinCategory: 'Company', nationalId: '',
      passportNo: '', dateOfBirth: '',
      incorporationDate: '2019-11-15', email: 'info@bdtech.com',
      phone: '01766-666666', address: 'Banani, Dhaka',
      district: 'Dhaka', division: 'Dhaka',
      taxZone: 'Zone-2', taxCircle: 'Circle-4',
      issuedDate: '2024-03-10', lastUpdated: '2024-03-10',
      status: 'Active', remarks: ''
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Tin[]>(API_ENDPOINTS.TIN.LIST).subscribe({
      next: data => { this.tins = data;           this.isLoading = false; },
      error: ()   => { this.tins = this.fallback; this.isLoading = false; }
    });
  }

  get filteredTins(): Tin[] {
    if (!this.searchTerm.trim()) return this.tins;
    const term = this.searchTerm.toLowerCase();
    return this.tins.filter(t =>
      t.tinNumber.toLowerCase().includes(term)      ||
      t.taxpayerName.toLowerCase().includes(term)   ||
      t.tinCategory.toLowerCase().includes(term)    ||
      t.taxZone.toLowerCase().includes(term)        ||
      t.district.toLowerCase().includes(term)
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
      'Individual':  'cat-individual',
      'Company':     'cat-company',
      'Partnership': 'cat-partner',
      'NGO':         'cat-ngo',
      'Government':  'cat-govt'
    };
    return map[c] ?? '';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Individual':  'bi bi-person-fill',
      'Company':     'bi bi-building-fill',
      'Partnership': 'bi bi-people-fill',
      'NGO':         'bi bi-heart-fill',
      'Government':  'bi bi-bank2'
    };
    return map[c] ?? 'bi bi-person-fill';
  }

  view(id: number): void { this.router.navigate(['/tin/view', id]); }
  edit(id: number): void { this.router.navigate(['/tin/edit', id]); }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this TIN record?')) return;
    this.http.delete(API_ENDPOINTS.TIN.DELETE(id)).subscribe({
      next: () => { this.tins = this.tins.filter(t => t.id !== id); },
      error: ()  => { alert('Failed to delete TIN record, Please try again.'); }
    });
  }
} 