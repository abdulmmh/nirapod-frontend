import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tin } from '../../../../models/tin.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-tin-view',
  templateUrl: './tin-view.component.html',
  styleUrls: ['./tin-view.component.css']
})
export class TinViewComponent implements OnInit {

  tin: Tin | null = null;
  isLoading = true;

  private fallback: Tin[] = [
    { id: 1, tinNumber: 'TIN-2024-001001', taxpayerName: 'Abdul Karim', tinCategory: 'Individual', nationalId: '1234567890123', passportNo: '', dateOfBirth: '1985-03-15', incorporationDate: '', email: 'abdul.karim@example.com', phone: '01711-111111', address: 'Mirpur, Dhaka', district: 'Dhaka', division: 'Dhaka', taxZone: 'Zone-1', taxCircle: 'Circle-5', issuedDate: '2024-01-10', lastUpdated: '2024-01-10', status: 'Active', remarks: '' },
    { id: 2, tinNumber: 'TIN-2024-001002', taxpayerName: 'Rahman Textile Ltd.', tinCategory: 'Company', nationalId: '', passportNo: '', dateOfBirth: '', incorporationDate: '2015-06-01', email: 'rahman@textile.com', phone: '01711-222222', address: 'Mirpur DOHS, Dhaka', district: 'Dhaka', division: 'Dhaka', taxZone: 'Zone-2', taxCircle: 'Circle-3', issuedDate: '2024-01-15', lastUpdated: '2024-01-15', status: 'Active', remarks: '' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Tin>(API_ENDPOINTS.TINS.GET(id)).subscribe({
      next: data => { this.tin = data; this.isLoading = false; },
      error: ()  => { 
      this.tin = this.fallback.find(t => t.id === id) || this.fallback[0];
      this.isLoading = false;
      }
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended',
      'Cancelled': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Individual': 'bi bi-person-fill', 'Company': 'bi bi-building-fill',
      'Partnership': 'bi bi-people-fill', 'NGO': 'bi bi-heart-fill',
      'Government': 'bi bi-bank2'
    };
    return map[c] ?? 'bi bi-person-fill';
  }

  onEdit(): void { this.router.navigate(['/tin/edit', this.tin?.id]); }
  onBack(): void { this.router.navigate(['/tin']); }
}