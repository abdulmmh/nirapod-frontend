import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Penalty } from '../../../../models/penalty.model';

@Component({
  selector: 'app-penalty-view',
  templateUrl: './penalty-view.component.html',
  styleUrls: ['./penalty-view.component.css']
})
export class PenaltyViewComponent implements OnInit {

  penalty: Penalty | null = null;
  isLoading = true;

  private fallback: Penalty[] = [
    {
      id: 1, penaltyNo: 'PEN-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      penaltyType: 'Late Filing', severity: 'Medium',
      penaltyAmount: 25000, interestAmount: 3750, totalAmount: 28750,
      paidAmount: 28750, returnNo: 'VAT-2024-00001',
      assessmentYear: '2024-25',
      issueDate: '2024-03-01', dueDate: '2024-03-31',
      paymentDate: '2024-03-28',
      status: 'Paid', issuedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner',
      description: 'Late filing of VAT return for Jan 2024',
      remarks: ''
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Penalty>(API_ENDPOINTS.PENALTIES.GET(id)).subscribe({
      next: data => { this.penalty = data; this.isLoading = false; },
      error: ()  => {
        this.penalty = this.fallback.find(p => p.id === id) || this.fallback[0];
        this.isLoading = false;
      }
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Issued': 'status-issued', 'Pending': 'status-pending',
      'Paid': 'status-active', 'Waived': 'status-waived',
      'Appealed': 'status-appealed', 'Overdue': 'status-overdue'
    };
    return map[s] ?? '';
  }

  getSeverityClass(s: string): string {
    const map: Record<string, string> = {
      'Low': 'sev-low', 'Medium': 'sev-medium',
      'High': 'sev-high', 'Critical': 'sev-critical'
    };
    return map[s] ?? '';
  }

  fmt(amount: number): string {
    return `৳${amount.toLocaleString()}`;
  }

  onEdit(): void { this.router.navigate(['/penalties', 'edit', this.penalty?.id]); }
  onBack(): void { this.router.navigate(['/penalties']); }
}