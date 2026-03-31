import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturn } from '../../../../models/income-tax-return.model';

@Component({
  selector: 'app-income-tax-list',
  templateUrl: './income-tax-list.component.html',
  styleUrls: ['./income-tax-list.component.css']
})
export class IncomeTaxListComponent implements OnInit {

  returns: IncomeTaxReturn[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: IncomeTaxReturn[] = [
    {
      id: 1, returnNo: 'ITR-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      submissionDate: '2024-11-30',
      salaryIncome: 0, businessIncome: 15000000,
      housePropertyIncome: 500000, capitalGainIncome: 0, otherIncome: 200000,
      totalIncome: 15700000, taxableIncome: 15200000,
      grossTax: 3420000, taxRebate: 200000,
      netTaxPayable: 3220000, taxPaid: 3220000, taxRefundable: 0,
      paymentStatus: 'Paid', returnStatus: 'Approved',
      submittedBy: 'Tax Officer', remarks: ''
    },
    {
      id: 2, returnNo: 'ITR-2024-00002',
      tinNumber: 'TIN-1002', taxpayerName: 'Abdul Karim',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      submissionDate: '2024-11-25',
      salaryIncome: 1200000, businessIncome: 0,
      housePropertyIncome: 240000, capitalGainIncome: 0, otherIncome: 60000,
      totalIncome: 1500000, taxableIncome: 1250000,
      grossTax: 112500, taxRebate: 15000,
      netTaxPayable: 97500, taxPaid: 97500, taxRefundable: 0,
      paymentStatus: 'Paid', returnStatus: 'Approved',
      submittedBy: 'Taxpayer', remarks: ''
    },
    {
      id: 3, returnNo: 'ITR-2024-00003',
      tinNumber: 'TIN-1003', taxpayerName: 'Dhaka Pharma Co.',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      submissionDate: '2024-11-28',
      salaryIncome: 0, businessIncome: 25000000,
      housePropertyIncome: 0, capitalGainIncome: 500000, otherIncome: 0,
      totalIncome: 25500000, taxableIncome: 25000000,
      grossTax: 6250000, taxRebate: 500000,
      netTaxPayable: 5750000, taxPaid: 3000000, taxRefundable: 0,
      paymentStatus: 'Partial', returnStatus: 'Under Review',
      submittedBy: 'Tax Officer', remarks: 'Partial payment received'
    },
    {
      id: 4, returnNo: 'ITR-2024-00004',
      tinNumber: 'TIN-1004', taxpayerName: 'Nusrat Jahan',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      submissionDate: '2024-11-20',
      salaryIncome: 850000, businessIncome: 0,
      housePropertyIncome: 0, capitalGainIncome: 0, otherIncome: 50000,
      totalIncome: 900000, taxableIncome: 650000,
      grossTax: 22500, taxRebate: 5000,
      netTaxPayable: 17500, taxPaid: 0, taxRefundable: 0,
      paymentStatus: 'Unpaid', returnStatus: 'Pending',
      submittedBy: 'Taxpayer', remarks: 'Payment due'
    },
    {
      id: 5, returnNo: 'ITR-2024-00005',
      tinNumber: 'TIN-1005', taxpayerName: 'Chittagong Exports',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      submissionDate: '2024-11-15',
      salaryIncome: 0, businessIncome: 42000000,
      housePropertyIncome: 1200000, capitalGainIncome: 800000, otherIncome: 0,
      totalIncome: 44000000, taxableIncome: 43500000,
      grossTax: 11375000, taxRebate: 750000,
      netTaxPayable: 10625000, taxPaid: 10625000, taxRefundable: 0,
      paymentStatus: 'Paid', returnStatus: 'Submitted',
      submittedBy: 'Tax Officer', remarks: ''
    },
    {
      id: 6, returnNo: 'ITR-2024-00006',
      tinNumber: 'TIN-1006', taxpayerName: 'BD Tech Solutions',
      assessmentYear: '2024-25', incomeYear: '2023-24',
      submissionDate: '2024-11-10',
      salaryIncome: 0, businessIncome: 12000000,
      housePropertyIncome: 0, capitalGainIncome: 0, otherIncome: 300000,
      totalIncome: 12300000, taxableIncome: 12000000,
      grossTax: 2700000, taxRebate: 300000,
      netTaxPayable: 2400000, taxPaid: 2400000, taxRefundable: 0,
      paymentStatus: 'Paid', returnStatus: 'Rejected',
      submittedBy: 'Data Entry', remarks: 'Incorrect figures — resubmit required'
    },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<IncomeTaxReturn[]>(API_ENDPOINTS.TAXPAYERS.LIST).subscribe({
      next: data => { this.returns = data;           this.isLoading = false; },
      error: ()   => { this.returns = this.fallback; this.isLoading = false; }
    });
  }

  get filteredReturns(): IncomeTaxReturn[] {
    if (!this.searchTerm.trim()) return this.returns;
    const term = this.searchTerm.toLowerCase();
    return this.returns.filter(r =>
      r.returnNo.toLowerCase().includes(term)       ||
      r.tinNumber.toLowerCase().includes(term)      ||
      r.taxpayerName.toLowerCase().includes(term)   ||
      r.assessmentYear.toLowerCase().includes(term) ||
      r.incomeYear.toLowerCase().includes(term)
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
    if (amount >= 10000000) return `৳${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000)   return `৳${(amount / 100000).toFixed(2)} L`;
    return `৳${amount.toLocaleString()}`;
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this IT return?')) return;
    this.http.delete(`${API_ENDPOINTS.TAXPAYERS.LIST}/${id}`).subscribe({
      next: () => { this.returns = this.returns.filter(r => r.id !== id); },
      error: ()  => { this.returns = this.returns.filter(r => r.id !== id); }
    });
  }
}