import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Refund } from '../../../../models/refund.model';

@Component({
  selector: 'app-refund-view',
  templateUrl: './refund-view.component.html',
  styleUrls: ['./refund-view.component.css'],
})
export class RefundViewComponent implements OnInit {
  refund: Refund | null = null;
  isLoading = true;

  private fallback: Refund[] = [
    {
      taxpayerId: 0,
      id: 1,
      refundNo: 'RFD-2024-00001',
      tinNumber: 'TIN-1001',
      taxpayerName: 'Rahman Textile Ltd.',
      refundType: 'VAT Refund',
      refundMethod: 'Bank Transfer',
      claimAmount: 90000,
      approvedAmount: 85000,
      paidAmount: 85000,
      returnNo: 'VAT-2024-00001',
      paymentRef: 'TXN-2024-44821',
      bankName: 'Sonali Bank',
      bankBranch: 'Motijheel Branch',
      accountNo: '1234567890',
      claimDate: '2024-03-20',
      approvalDate: '2024-04-05',
      paymentDate: '2024-04-10',
      status: 'Completed',
      processedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner',
      remarks: '',
      activityLog: [
        {
          title: 'Refund approved and sent to treasury',
          description: 'Amount ৳ 85,000 sent to Bangladesh Bank treasury',
          date: '2024-04-05',
          type: 'approved',
        },
        {
          title: 'VAT documentation verified',
          description: 'All supporting documents checked and validated',
          date: '2024-03-28',
          type: 'verified',
        },
        {
          title: 'Assigned to officer for review',
          description: 'Refund claim assigned for processing',
          date: '2024-03-22',
          type: 'assigned',
        },
        {
          title: 'Refund claim filed',
          description: 'VAT refund claim received and registered',
          date: '2024-03-20',
          type: 'filed',
        },
      ],
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Refund>(API_ENDPOINTS.PAYMENTS.GET(id)).subscribe({
      next: (data) => {
        this.refund = data;
        this.isLoading = false;
      },
      error: () => {
        this.refund =
          this.fallback.find((r) => r.id === id) || this.fallback[0];
        this.isLoading = false;
        this.toast.error('Failed to load refund details. Showing sample data.');
      },
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'status-pending',
      Approved: 'status-approved',
      Rejected: 'status-suspended',
      Processing: 'status-progress',
      Completed: 'status-active',
      Cancelled: 'status-inactive',
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VAT Refund': 'type-vat',
      'Income Tax Refund': 'type-it',
      'Excess Payment': 'type-excess',
      Other: 'type-other',
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    return `৳${amount.toLocaleString()}`;
  }

  getCurrentStep(): number {
    if (!this.refund) return 1;
    const statusStepMap: Record<string, number> = {
      'Pending': 1,
      'Processing': 2,
      'Approved': 4,
      'Completed': 6,
      'Rejected': 1,
      'Cancelled': 1,
    };
    return statusStepMap[this.refund.status] || 1;
  }

  isStepComplete(step: number): boolean {
    return this.getCurrentStep() > step;
  }

  getActivityColor(type: string): string {
    const colorMap: Record<string, string> = {
      'filed': 'td-green',
      'assigned': 'td-blue',
      'verified': 'td-green',
      'approved': 'td-green',
      'rejected': 'td-red',
      'completed': 'td-green',
      'default': 'td-blue',
    };
    return colorMap[type.toLowerCase()] || colorMap['default'];
  }

  onEdit(): void {
    this.router.navigate(['/refunds', this.refund?.id, 'edit']);
  }
  onBack(): void {
    this.router.navigate(['/refunds']);
  }
}
