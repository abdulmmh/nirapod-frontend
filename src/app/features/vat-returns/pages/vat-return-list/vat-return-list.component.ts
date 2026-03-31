import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatReturn } from '../../../../models/vat-return.model';

@Component({
  selector: 'app-vat-return-list',
  templateUrl: './vat-return-list.component.html',
  styleUrls: ['./vat-return-list.component.css']
})
export class VatReturnListComponent implements OnInit {

  vatReturns: VatReturn[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: VatReturn[] = [
    {
      id: 1, returnNo: 'VAT-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      binNumber: 'BIN-2024-001', taxPeriod: 'January 2024',
      periodFrom: '2024-01-01', periodTo: '2024-01-31',
      submissionDate: '2024-02-15',
      totalSales: 1500000, totalPurchases: 900000,
      vatOnSales: 225000, vatOnPurchases: 135000,
      netVatPayable: 90000, paymentStatus: 'Paid',
      returnStatus: 'Approved', submittedBy: 'Tax Officer',
      remarks: ''
    },
    {
      id: 2, returnNo: 'VAT-2024-00002',
      tinNumber: 'TIN-1002', taxpayerName: 'Karim Traders',
      binNumber: 'BIN-2024-002', taxPeriod: 'January 2024',
      periodFrom: '2024-01-01', periodTo: '2024-01-31',
      submissionDate: '2024-02-14',
      totalSales: 850000, totalPurchases: 520000,
      vatOnSales: 127500, vatOnPurchases: 78000,
      netVatPayable: 49500, paymentStatus: 'Paid',
      returnStatus: 'Approved', submittedBy: 'Tax Officer',
      remarks: ''
    },
    {
      id: 3, returnNo: 'VAT-2024-00003',
      tinNumber: 'TIN-1003', taxpayerName: 'Dhaka Pharma Co.',
      binNumber: 'BIN-2024-003', taxPeriod: 'February 2024',
      periodFrom: '2024-02-01', periodTo: '2024-02-29',
      submissionDate: '2024-03-14',
      totalSales: 2100000, totalPurchases: 1400000,
      vatOnSales: 315000, vatOnPurchases: 210000,
      netVatPayable: 105000, paymentStatus: 'Unpaid',
      returnStatus: 'Pending', submittedBy: 'Data Entry',
      remarks: 'Payment pending'
    },
    {
      id: 4, returnNo: 'VAT-2024-00004',
      tinNumber: 'TIN-1004', taxpayerName: 'Chittagong Exports',
      binNumber: 'BIN-2024-004', taxPeriod: 'February 2024',
      periodFrom: '2024-02-01', periodTo: '2024-02-29',
      submissionDate: '2024-03-10',
      totalSales: 3200000, totalPurchases: 2100000,
      vatOnSales: 480000, vatOnPurchases: 315000,
      netVatPayable: 165000, paymentStatus: 'Partial',
      returnStatus: 'Under Review', submittedBy: 'Tax Officer',
      remarks: 'Under audit review'
    },
    {
      id: 5, returnNo: 'VAT-2024-00005',
      tinNumber: 'TIN-1005', taxpayerName: 'Sylhet Tea House',
      binNumber: 'BIN-2024-005', taxPeriod: 'March 2024',
      periodFrom: '2024-03-01', periodTo: '2024-03-31',
      submissionDate: '2024-04-12',
      totalSales: 620000, totalPurchases: 380000,
      vatOnSales: 93000, vatOnPurchases: 57000,
      netVatPayable: 36000, paymentStatus: 'Unpaid',
      returnStatus: 'Rejected', submittedBy: 'Taxpayer',
      remarks: 'Incorrect figures submitted'
    },
    {
      id: 6, returnNo: 'VAT-2024-00006',
      tinNumber: 'TIN-1006', taxpayerName: 'BD Tech Solutions',
      binNumber: 'BIN-2024-006', taxPeriod: 'March 2024',
      periodFrom: '2024-03-01', periodTo: '2024-03-31',
      submissionDate: '2024-04-10',
      totalSales: 980000, totalPurchases: 640000,
      vatOnSales: 147000, vatOnPurchases: 96000,
      netVatPayable: 51000, paymentStatus: 'Paid',
      returnStatus: 'Submitted', submittedBy: 'Tax Officer',
      remarks: ''
    },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<VatReturn[]>(API_ENDPOINTS.VAT_RETURNS.LIST).subscribe({
      next: data => { this.vatReturns = data;           this.isLoading = false; },
      error: ()   => { this.vatReturns = this.fallback; this.isLoading = false; }
    });
  }

  get filteredReturns(): VatReturn[] {
    if (!this.searchTerm.trim()) return this.vatReturns;
    const term = this.searchTerm.toLowerCase();
    return this.vatReturns.filter(v =>
      v.returnNo.toLowerCase().includes(term)      ||
      v.taxpayerName.toLowerCase().includes(term)  ||
      v.tinNumber.toLowerCase().includes(term)     ||
      v.binNumber.toLowerCase().includes(term)     ||
      v.taxPeriod.toLowerCase().includes(term)
    );
  }

  getReturnStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Submitted':    'status-progress',
      'Approved':     'status-active',
      'Rejected':     'status-suspended',
      'Pending':      'status-pending',
      'Under Review': 'status-review'
    };
    return map[status] ?? '';
  }

  getPaymentStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Paid':    'pay-paid',
      'Unpaid':  'pay-unpaid',
      'Partial': 'pay-partial'
    };
    return map[status] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this VAT return?')) return;
    this.http.delete(API_ENDPOINTS.VAT_RETURNS.GET(id)).subscribe({
      next: () => { this.vatReturns = this.vatReturns.filter(v => v.id !== id); },
      error: ()  => { this.vatReturns = this.vatReturns.filter(v => v.id !== id); }
    });
  }
}