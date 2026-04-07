import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment } from '../../../../models/payment.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {

  payments: Payment[] = [];
  searchTerm = '';
  isLoading  = false;

  errorMsg   = ''; 

  private destroy$ = new Subject<void>(); 

  showDeleteModal   = false;
  pendingDeleteId: number | null = null;

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
    {
      id: 3, transactionId: 'TXN-2024-44823',
      tinNumber: 'TIN-1003', taxpayerName: 'Dhaka Pharma Co.',
      paymentType: 'VAT', paymentMethod: 'Cheque',
      amount: 210000, bankName: 'Islami Bank',
      bankBranch: 'Dhanmondi Branch', accountNo: '1122334455',
      chequeNo: 'CHQ-889921', paymentDate: '2024-03-14', valueDate: '2024-03-16',
      referenceNo: 'REF-2024-003', returnNo: 'VAT-2024-00003',
      status: 'Pending', processedBy: 'Data Entry',
      remarks: 'Cheque clearance pending', createdAt: '2024-03-14'
    },
    {
      id: 4, transactionId: 'TXN-2024-44824',
      tinNumber: 'TIN-1004', taxpayerName: 'Chittagong Exports',
      paymentType: 'Penalty', paymentMethod: 'Bank Transfer',
      amount: 55000, bankName: 'Agrani Bank',
      bankBranch: 'Agrabad Branch', accountNo: '5566778899',
      chequeNo: '', paymentDate: '2024-03-14', valueDate: '2024-03-14',
      referenceNo: 'REF-2024-004', returnNo: '',
      status: 'Completed', processedBy: 'Tax Officer',
      remarks: 'Late filing penalty', createdAt: '2024-03-14'
    },
    {
      id: 5, transactionId: 'TXN-2024-44825',
      tinNumber: 'TIN-1005', taxpayerName: 'Sylhet Tea House',
      paymentType: 'VAT', paymentMethod: 'Mobile Banking',
      amount: 33000, bankName: 'bKash',
      bankBranch: '', accountNo: '01711-678901',
      chequeNo: '', paymentDate: '2024-03-13', valueDate: '2024-03-13',
      referenceNo: 'REF-2024-005', returnNo: 'VAT-2024-00005',
      status: 'Failed', processedBy: 'Taxpayer',
      remarks: 'Transaction failed — insufficient balance', createdAt: '2024-03-13'
    },
    {
      id: 6, transactionId: 'TXN-2024-44826',
      tinNumber: 'TIN-1006', taxpayerName: 'BD Tech Solutions',
      paymentType: 'Income Tax', paymentMethod: 'Bank Transfer',
      amount: 240000, bankName: 'BRAC Bank',
      bankBranch: 'Banani Branch', accountNo: '6677889900',
      chequeNo: '', paymentDate: '2024-03-12', valueDate: '2024-03-12',
      referenceNo: 'REF-2024-006', returnNo: 'ITR-2024-00006',
      status: 'Refunded', processedBy: 'Tax Officer',
      remarks: 'Overpayment refunded', createdAt: '2024-03-12'
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Payment[]>(API_ENDPOINTS.PAYMENTS.LIST).subscribe({
      next: data => { this.payments = data;           this.isLoading = false; },
      error: ()   => { this.payments = this.fallback; this.isLoading = false; }
    });
  }

   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get filteredPayments(): Payment[] {
    if (!this.searchTerm.trim()) return this.payments;
    const term = this.searchTerm.toLowerCase();
    return this.payments.filter(p =>
      p.transactionId.toLowerCase().includes(term)  ||
      p.taxpayerName.toLowerCase().includes(term)   ||
      p.tinNumber.toLowerCase().includes(term)      ||
      p.paymentType.toLowerCase().includes(term)    ||
      p.referenceNo.toLowerCase().includes(term)
    );
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
      'VAT':         'type-vat',
      'Income Tax':  'type-it',
      'Penalty':     'type-penalty',
      'Refund':      'type-refund',
      'Other':       'type-other'
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }

  viewPayment(id: number): void {
    this.router.navigate(['/payments','view', id]);
  }

  editPayment(id: number): void {
    this.router.navigate(['/payments','edit', id]);
  }

   confirmDelete(id: number): void {
      this.pendingDeleteId = id;
      this.showDeleteModal = true;
    }
    cancelDelete(): void {
      this.pendingDeleteId = null;
      this.showDeleteModal = false;
    }
  
    confirmDeleteExecute(): void {
      if (this.pendingDeleteId === null) return;
      const id = this.pendingDeleteId;
      this.showDeleteModal  = false;
      this.pendingDeleteId  = null;
      this.errorMsg         = '';
  
      this.http.delete(API_ENDPOINTS.PAYMENTS.DELETE(id))
        .pipe(takeUntil(this.destroy$)) // FIX #3: Auto-cancel on destroy
        .subscribe({
          next: () => {
            this.payments = this.payments.filter(p => p.id !== id);
          },
          error: () => {
            this.errorMsg = 'Failed to delete payment. Please try again.';
          }
        });
    }
}