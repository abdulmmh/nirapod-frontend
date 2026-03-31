import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Refund } from '../../../../models/refund.model';

@Component({
  selector: 'app-refund-view',
  templateUrl: './refund-view.component.html',
  styleUrls: ['./refund-view.component.css']
})
export class RefundViewComponent implements OnInit {

  refund: Refund | null = null;
  isLoading = true;

  private fallback: Refund[] = [
    {
      id: 1, refundNo: 'RFD-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      refundType: 'VAT Refund', refundMethod: 'Bank Transfer',
      claimAmount: 90000, approvedAmount: 85000, paidAmount: 85000,
      returnNo: 'VAT-2024-00001', paymentRef: 'TXN-2024-44821',
      bankName: 'Sonali Bank', bankBranch: 'Motijheel Branch',
      accountNo: '1234567890',
      claimDate: '2024-03-20', approvalDate: '2024-04-05',
      paymentDate: '2024-04-10',
      status: 'Completed', processedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner', remarks: ''
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Refund>(API_ENDPOINTS.PAYMENTS.GET(id)).subscribe({
      next: data => { this.refund = data; this.isLoading = false; },
      error: ()  => {
        this.refund = this.fallback.find(r => r.id === id) || this.fallback[0];
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'status-pending', 'Approved': 'status-approved',
      'Rejected': 'status-suspended', 'Processing': 'status-progress',
      'Completed': 'status-active', 'Cancelled': 'status-inactive'
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VAT Refund': 'type-vat', 'Income Tax Refund': 'type-it',
      'Excess Payment': 'type-excess', 'Other': 'type-other'
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    return `৳${amount.toLocaleString()}`;
  }

  onEdit(): void { this.router.navigate(['/refunds', this.refund?.id, 'edit']); }
  onBack(): void { this.router.navigate(['/refunds']); }
}