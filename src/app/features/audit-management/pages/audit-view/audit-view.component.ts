import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Audit } from '../../../../models/audit.model';

@Component({
  selector: 'app-audit-view',
  templateUrl: './audit-view.component.html',
  styleUrls: ['./audit-view.component.css']
})
export class AuditViewComponent implements OnInit {

  audit: Audit | null = null;
  isLoading = true;

  private fallback: Audit[] = [
    {
      id: 1, auditNo: 'AUD-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      auditType: 'VAT Audit', priority: 'High',
      assessmentYear: '2024-25', returnNo: 'VAT-2024-00001',
      scheduledDate: '2024-03-01', startDate: '2024-03-05',
      completionDate: '2024-03-20',
      assignedTo: 'Auditor Rahim', supervisedBy: 'Tax Commissioner',
      auditFindings: 'Minor discrepancies found in VAT records',
      taxDemand: 45000, penaltyRecommended: 12000,
      status: 'Completed', remarks: 'Taxpayer notified'
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Audit>(API_ENDPOINTS.AUDITS.GET(id)).subscribe({
      next: data => { this.audit = data; this.isLoading = false; },
      error: ()  => {
        this.audit = this.fallback.find(a => a.id === id) || this.fallback[0];
        this.isLoading = false;
      }
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Scheduled': 'status-scheduled', 'In Progress': 'status-progress',
      'Completed': 'status-active', 'Flagged': 'status-flagged',
      'Cancelled': 'status-inactive', 'Pending': 'status-pending'
    };
    return map[s] ?? '';
  }

  getPriorityClass(p: string): string {
    const map: Record<string, string> = {
      'Low': 'pri-low', 'Medium': 'pri-medium',
      'High': 'pri-high', 'Critical': 'pri-critical'
    };
    return map[p] ?? '';
  }

  fmt(amount: number): string {
    if (amount === 0) return '—';
    return `৳${amount.toLocaleString()}`;
  }

  onEdit(): void { this.router.navigate(['/audits', this.audit?.id, 'edit']); }
  onBack(): void { this.router.navigate(['/audits']); }
}