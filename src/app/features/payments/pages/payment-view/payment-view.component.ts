import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment } from '../../../../models/payment.model';

@Component({
  selector: 'app-payment-view',
  templateUrl: './payment-view.component.html',
  styleUrls: ['./payment-view.component.css']
})
export class PaymentViewComponent implements OnInit {

  payment: Payment | null = null;
  isLoading = true;

  private fallback: Payment[] = [
    {
      id: 1, transactionId: 'TXN-2024-44821',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      paymentType: 'VAT', paymentMethod: 'Bank Transfer',
      amount: 125000, bankName: 'Sonali Bank',
      bankBranch: 'Motijheel Branch', accountNo: '1234567890',
      chequeNo: '', paymentDate: '2024-03-15', valueDate: '2024-03-15',
      referenceNo: 'REF-2024-001', returnNo: 'VAT-2024-00001',
      status: 'Completed', processedBy: 'Tax Officer',
      remarks: '', createdAt: '2024-03-15'
    },
    {
      id: 2, transactionId: 'TXN-2024-44822',
      tinNumber: 'TIN-1002', taxpayerName: 'Karim Traders',
      paymentType: 'Income Tax', paymentMethod: 'Online Banking',
      amount: 87500, bankName: 'Dutch-Bangla Bank',
      bankBranch: 'Gulshan Branch', accountNo: '9876543210',
      chequeNo: '', paymentDate: '2024-03-15', valueDate: '2024-03-15',
      referenceNo: 'REF-2024-002', returnNo: 'ITR-2024-00002',
      status: 'Completed', processedBy: 'Tax Officer',
      remarks: '', createdAt: '2024-03-15'
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Payment>(API_ENDPOINTS.PAYMENTS.GET(id)).subscribe({
      next: data  => { this.payment = data; this.isLoading = false; },
      error: ()   => {
        this.payment = this.fallback.find(p => p.id === id) || this.fallback[0];
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Completed': 'status-active',
      'Pending':   'status-pending',
      'Failed':    'status-suspended',
      'Refunded':  'status-refunded',
      'Cancelled': 'status-inactive'
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VAT':        'type-vat',
      'Income Tax': 'type-it',
      'Penalty':    'type-penalty',
      'Refund':     'type-refund',
      'Other':      'type-other'
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    return `৳${amount.toLocaleString()}`;
  }

  onEdit(): void {
    this.router.navigate(['/payments', 'edit', this.payment?.id]);
  }

  onBack(): void {
    this.router.navigate(['/payments']);
  }
}