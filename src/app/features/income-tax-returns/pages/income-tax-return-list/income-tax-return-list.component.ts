import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturn } from '../../../../models/income-tax-return.model';

@Component({
  selector: 'app-income-tax-return-list',
  templateUrl: './income-tax-return-list.component.html',
  styleUrls: ['./income-tax-return-list.component.css']
})
export class IncomeTaxReturnListComponent implements OnInit {

  returns: IncomeTaxReturn[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: IncomeTaxReturn[] = [
    {
      id: 1, returnNo: 'ITR-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Abdul Karim',
      itrCategory: 'Individual', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 1200000, exemptIncome: 200000,
      taxableIncome: 1000000, taxRate: 15,
      grossTax: 150000, taxRebate: 10000,
      netTaxPayable: 140000, advanceTaxPaid: 50000,
      withholdingTax: 30000, taxPaid: 80000,
      refundable: 0,
      submissionDate: '2024-11-25', dueDate: '2024-11-30',
      status: 'Accepted', submittedBy: 'Taxpayer',
      verifiedBy: 'Tax Officer', remarks: ''
    },
    {
      id: 2, returnNo: 'ITR-2024-00002',
      tinNumber: 'TIN-1002', taxpayerName: 'Rahman Textile Ltd.',
      itrCategory: 'Company', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 5000000, exemptIncome: 0,
      taxableIncome: 5000000, taxRate: 27.5,
      grossTax: 1375000, taxRebate: 0,
      netTaxPayable: 1375000, advanceTaxPaid: 800000,
      withholdingTax: 200000, taxPaid: 1000000,
      refundable: 0,
      submissionDate: '2024-11-28', dueDate: '2024-11-30',
      status: 'Accepted', submittedBy: 'Tax Officer',
      verifiedBy: 'Tax Commissioner', remarks: ''
    },
    {
      id: 3, returnNo: 'ITR-2024-00003',
      tinNumber: 'TIN-1003', taxpayerName: 'Nusrat Jahan',
      itrCategory: 'Individual', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 800000, exemptIncome: 350000,
      taxableIncome: 450000, taxRate: 10,
      grossTax: 45000, taxRebate: 5000,
      netTaxPayable: 40000, advanceTaxPaid: 0,
      withholdingTax: 45000, taxPaid: 45000,
      refundable: 5000,
      submissionDate: '2024-11-30', dueDate: '2024-11-30',
      status: 'Under Review', submittedBy: 'Taxpayer',
      verifiedBy: '', remarks: 'Refund claim under review'
    },
    {
      id: 4, returnNo: 'ITR-2024-00004',
      tinNumber: 'TIN-1004', taxpayerName: 'Karim Traders',
      itrCategory: 'Partnership', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 2500000, exemptIncome: 0,
      taxableIncome: 2500000, taxRate: 25,
      grossTax: 625000, taxRebate: 0,
      netTaxPayable: 625000, advanceTaxPaid: 300000,
      withholdingTax: 100000, taxPaid: 400000,
      refundable: 0,
      submissionDate: '', dueDate: '2024-11-30',
      status: 'Overdue', submittedBy: '',
      verifiedBy: '', remarks: 'Not yet filed'
    },
    {
      id: 5, returnNo: 'ITR-2024-00005',
      tinNumber: 'TIN-1005', taxpayerName: 'BD Tech Solutions',
      itrCategory: 'Company', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 6500000, exemptIncome: 0,
      taxableIncome: 6500000, taxRate: 27.5,
      grossTax: 1787500, taxRebate: 0,
      netTaxPayable: 1787500, advanceTaxPaid: 1200000,
      withholdingTax: 300000, taxPaid: 1500000,
      refundable: 0,
      submissionDate: '2024-11-20', dueDate: '2024-11-30',
      status: 'Submitted', submittedBy: 'Tax Officer',
      verifiedBy: '', remarks: 'Pending review'
    },
    {
      id: 6, returnNo: 'ITR-2024-00006',
      tinNumber: 'TIN-1006', taxpayerName: 'Rahim Ali',
      itrCategory: 'Individual', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 600000, exemptIncome: 600000,
      taxableIncome: 0, taxRate: 0,
      grossTax: 0, taxRebate: 0,
      netTaxPayable: 0, advanceTaxPaid: 0,
      withholdingTax: 0, taxPaid: 0,
      refundable: 0,
      submissionDate: '2024-11-15', dueDate: '2024-11-30',
      status: 'Accepted', submittedBy: 'Taxpayer',
      verifiedBy: 'Tax Officer', remarks: 'Zero tax - exempt income'
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<IncomeTaxReturn[]>(API_ENDPOINTS.TAXPAYERS.LIST).subscribe({
      next: data => { this.returns = data;           this.isLoading = false; },
      error: ()   => { this.returns = this.fallback; this.isLoading = false; }
    });
  }

  get filtered(): IncomeTaxReturn[] {
    if (!this.searchTerm.trim()) return this.returns;
    const term = this.searchTerm.toLowerCase();
    return this.returns.filter(r =>
      r.returnNo.toLowerCase().includes(term)       ||
      r.taxpayerName.toLowerCase().includes(term)   ||
      r.tinNumber.toLowerCase().includes(term)      ||
      r.itrCategory.toLowerCase().includes(term)    ||
      r.assessmentYear.toLowerCase().includes(term)
    );
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft':        'status-draft',
      'Submitted':    'status-pending',
      'Accepted':     'status-active',
      'Rejected':     'status-suspended',
      'Overdue':      'status-overdue',
      'Under Review': 'status-review',
      'Amended':      'status-amended'
    };
    return map[s] ?? '';
  }

  getCategoryClass(c: string): string {
    const map: Record<string, string> = {
      'Individual':  'cat-individual',
      'Company':     'cat-company',
      'Partnership': 'cat-partner',
      'NGO':         'cat-ngo'
    };
    return map[c] ?? '';
  }

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }

  view(id: number): void { this.router.navigate(['/income-tax-returns/view', id]); }
  edit(id: number): void { this.router.navigate(['/income-tax-returns/edit', id]); }

  delete(id: number): void {
    if (!confirm('Delete this income tax return?')) return;
    this.returns = this.returns.filter(r => r.id !== id);
  }
}