import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';

@Component({
  selector: 'app-taxpayer-view',
  templateUrl: './taxpayer-view.component.html',
  styleUrls: ['./taxpayer-view.component.css']
})
export class TaxpayerViewComponent implements OnInit {

  taxpayer: Taxpayer | null = null;
  isLoading = true;

  private fallback: Taxpayer[] = [
    { id: 1, tin: 'TIN-1001', fullName: 'Abdul Karim', email: 'abdul.karim@example.com', phone: '01711111111', taxpayerType: 'Individual', status: 'Active', registrationDate: '2024-01-10', address: 'Mirpur, Dhaka', nationalId: '1234567890123', dateOfBirth: '1985-03-15' },
    { id: 2, tin: 'TIN-1002', fullName: 'Nusrat Jahan', email: 'nusrat.jahan@example.com', phone: '01822222222', taxpayerType: 'Business', status: 'Inactive', registrationDate: '2024-01-15', address: 'Gulshan, Dhaka', nationalId: '9876543210123', dateOfBirth: '1990-07-22' },
    { id: 3, tin: 'TIN-1003', fullName: 'Rahim Traders Ltd.', email: 'rahim.traders@example.com', phone: '01933333333', taxpayerType: 'Company', status: 'Pending', registrationDate: '2024-02-01', address: 'Motijheel, Dhaka', nationalId: '1122334455667', dateOfBirth: '' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(id)).subscribe({
      next: data => { this.taxpayer = data; this.isLoading = false; },
      error: ()  => {
        this.taxpayer = this.fallback.find(t => t.id === id) || this.fallback[0];
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended'
    };
    return map[status] ?? '';
  }

  onEdit(): void { this.router.navigate(['/taxpayers', 'edit', this.taxpayer?.id]); }
  onBack(): void { this.router.navigate(['/taxpayers']); }
}