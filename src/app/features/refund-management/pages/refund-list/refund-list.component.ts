import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Refund } from '../../../../models/refund.model';

@Component({
  selector: 'app-refund-list',
  templateUrl: './refund-list.component.html',
  styleUrls: ['./refund-list.component.css']
})
export class RefundListComponent implements OnInit {

  refunds: Refund[] = [];
  searchTerm = '';
  isLoading  = false;

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
    {
      id: 2, refundNo: 'RFD-2024-00002',
      tinNumber: 'TIN-1002', taxpayerName: 'Karim Traders',
      refundType: 'Income Tax Refund', refundMethod: 'Bank Transfer',
      claimAmount: 25000, approvedAmount: 25000, paidAmount: 0,
      returnNo: 'ITR-2024-00002', paymentRef: 'TXN-2024-44822',
      bankName: 'Dutch-Bangla Bank', bankBranch: 'Gulshan Branch',
      accountNo: '9876543210',
      claimDate: '2024-03-22', approvalDate: '2024-04-08',
      paymentDate: '',
      status: 'Approved', processedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner', remarks: 'Payment scheduled'
    },
    {
      id: 3, refundNo: 'RFD-2024-00003',
      tinNumber: 'TIN-1003', taxpayerName: 'Dhaka Pharma Co.',
      refundType: 'Excess Payment', refundMethod: 'Cheque',
      claimAmount: 150000, approvedAmount: 0, paidAmount: 0,
      returnNo: '', paymentRef: 'TXN-2024-44823',
      bankName: 'Islami Bank', bankBranch: 'Dhanmondi Branch',
      accountNo: '1122334455',
      claimDate: '2024-03-25', approvalDate: '',
      paymentDate: '',
      status: 'Pending', processedBy: 'Data Entry',
      approvedBy: '', remarks: 'Awaiting verification'
    },
    {
      id: 4, refundNo: 'RFD-2024-00004',
      tinNumber: 'TIN-1004', taxpayerName: 'Chittagong Exports',
      refundType: 'VAT Refund', refundMethod: 'Adjustment',
      claimAmount: 45000, approvedAmount: 40000, paidAmount: 0,
      returnNo: 'VAT-2024-00004', paymentRef: 'TXN-2024-44824',
      bankName: '', bankBranch: '', accountNo: '',
      claimDate: '2024-03-28', approvalDate: '2024-04-12',
      paymentDate: '',
      status: 'Processing', processedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner', remarks: 'Adjustment against next period'
    },
    {
      id: 5, refundNo: 'RFD-2024-00005',
      tinNumber: 'TIN-1005', taxpayerName: 'Sylhet Tea House',
      refundType: 'Income Tax Refund', refundMethod: 'Bank Transfer',
      claimAmount: 18000, approvedAmount: 0, paidAmount: 0,
      returnNo: 'ITR-2024-00005', paymentRef: '',
      bankName: 'Agrani Bank', bankBranch: 'Sylhet Branch',
      accountNo: '5566778899',
      claimDate: '2024-04-01', approvalDate: '',
      paymentDate: '',
      status: 'Rejected', processedBy: 'Tax Officer',
      approvedBy: '', remarks: 'Insufficient documentation'
    },
    {
      id: 6, refundNo: 'RFD-2024-00006',
      tinNumber: 'TIN-1006', taxpayerName: 'BD Tech Solutions',
      refundType: 'VAT Refund', refundMethod: 'Bank Transfer',
      claimAmount: 62000, approvedAmount: 62000, paidAmount: 0,
      returnNo: 'VAT-2024-00006', paymentRef: 'TXN-2024-44826',
      bankName: 'BRAC Bank', bankBranch: 'Banani Branch',
      accountNo: '6677889900',
      claimDate: '2024-04-05', approvalDate: '2024-04-15',
      paymentDate: '',
      status: 'Approved', processedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner', remarks: ''
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Refund[]>(API_ENDPOINTS.PAYMENTS.LIST).subscribe({
      next: data => { this.refunds = data;           this.isLoading = false; },
      error: ()   => { this.refunds = this.fallback; this.isLoading = false; }
    });
  }

  get filteredRefunds(): Refund[] {
    if (!this.searchTerm.trim()) return this.refunds;
    const term = this.searchTerm.toLowerCase();
    return this.refunds.filter(r =>
      r.refundNo.toLowerCase().includes(term)     ||
      r.taxpayerName.toLowerCase().includes(term) ||
      r.tinNumber.toLowerCase().includes(term)    ||
      r.refundType.toLowerCase().includes(term)   ||
      r.returnNo.toLowerCase().includes(term)
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending':    'status-pending',
      'Approved':   'status-approved',
      'Rejected':   'status-suspended',
      'Processing': 'status-progress',
      'Completed':  'status-active',
      'Cancelled':  'status-inactive'
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VAT Refund':         'type-vat',
      'Income Tax Refund':  'type-it',
      'Excess Payment':     'type-excess',
      'Other':              'type-other'
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }

  viewRefund(id: number): void {
    this.router.navigate(['/refunds', id]);
  }

  editRefund(id: number): void {
    this.router.navigate(['/refunds', id, 'edit']);
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this refund?')) return;
    this.http.delete(`${API_ENDPOINTS.PAYMENTS.LIST}/${id}`).subscribe({
      next: () => { this.refunds = this.refunds.filter(r => r.id !== id); },
      error: ()  => { this.refunds = this.refunds.filter(r => r.id !== id); }
    });
  }
}