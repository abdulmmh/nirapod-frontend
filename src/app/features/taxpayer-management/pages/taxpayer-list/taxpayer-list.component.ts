import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';

@Component({
  selector: 'app-taxpayer-list',
  templateUrl: './taxpayer-list.component.html',
  styleUrls: ['./taxpayer-list.component.css']
})
export class TaxpayerListComponent implements OnInit {

  taxpayers: Taxpayer[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: Taxpayer[] = [
    { id: 1, tin: 'TIN-1001', fullName: 'Abdul Karim',        email: 'abdul.karim@example.com',   phone: '01711111111', taxpayerType: 'Individual', nationalId: '1234567890123', dateOfBirth: '1985-03-15', address: 'Mirpur, Dhaka', status: 'Active',    registrationDate: '2024-01-10' },
    { id: 2, tin: 'TIN-1002', fullName: 'Nusrat Jahan',       email: 'nusrat.jahan@example.com',  phone: '01822222222', taxpayerType: 'Business',   nationalId: '9876543210123', dateOfBirth: '1990-07-22', address: 'Gulshan, Dhaka', status: 'Inactive',  registrationDate: '2024-01-15' },
    { id: 3, tin: 'TIN-1003', fullName: 'Rahim Traders Ltd.', email: 'rahim.traders@example.com', phone: '01933333333', taxpayerType: 'Company',    nationalId: '1122334455667', dateOfBirth: '', address: 'Motijheel, Dhaka', status: 'Pending',   registrationDate: '2024-02-01' },
    { id: 4, tin: 'TIN-1004', fullName: 'Sadia Islam',        email: 'sadia.islam@example.com',   phone: '01644444444', taxpayerType: 'Individual', nationalId: '5556667778889', dateOfBirth: '1995-12-10', address: 'Dhanmondi, Dhaka', status: 'Active',    registrationDate: '2024-02-20' },
    { id: 5, tin: 'TIN-1005', fullName: 'Chittagong Exports', email: 'ctg@exports.com',            phone: '01555555555', taxpayerType: 'Company',    nationalId: '9998887776665', dateOfBirth: '', address: 'Chittagong, Bangladesh', status: 'Active',    registrationDate: '2024-03-05' }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST).subscribe({
      next: data => { this.taxpayers = data;           this.isLoading = false; },
      error: ()   => { this.taxpayers = this.fallback; this.isLoading = false; }
    });
  }

  get filteredTaxpayers(): Taxpayer[] {
    if (!this.searchTerm.trim()) return this.taxpayers;
    const term = this.searchTerm.toLowerCase();
    return this.taxpayers.filter(tp =>
      tp.fullName.toLowerCase().includes(term) ||
      tp.tin.toLowerCase().includes(term)      ||
      tp.email.toLowerCase().includes(term)    ||
      tp.phone.includes(term)
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active':    'status-active',
      'Inactive':  'status-inactive',
      'Pending':   'status-pending',
      'Suspended': 'status-suspended'
    };
    return map[status] ?? '';
  }

  viewTaxpayers(id: number): void {
    this.router.navigate(['/taxpayers/view' , id]);
  }

  editTaxpayers(id: number): void {
    this.router.navigate(['/taxpayers/edit', id]);
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this taxpayer?')) return;
    this.http.delete(API_ENDPOINTS.TAXPAYERS.DELETE(id)).subscribe({
      next: () => { this.taxpayers = this.taxpayers.filter(t => t.id !== id); },
      error: ()  => { alert('Failed to delete taxpayer, Please try again.'); }
    });
  }
}