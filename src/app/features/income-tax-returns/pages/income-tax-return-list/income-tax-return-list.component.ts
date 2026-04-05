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
  searchTerm   = '';
  filterStatus = '';
  isLoading    = false;

  statuses = [
    '', 'Draft', 'Submitted', 'Under Review',
    'Accepted', 'Rejected', 'Overdue', 'Amended', 'Send Back'
  ];

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
      withholdingTax: 30000, taxPaid: 60000, refundable: 0,
      submissionDate: '2025-11-26', dueDate: '2025-11-30',
      status: 'Accepted', submittedBy: 'Taxpayer',
      verifiedBy: 'Tax Officer', remarks: '',
      actionHistory: [
        { action: 'Return Filed',    performedBy: 'taxpayer_01',  role: 'TAXPAYER',          timestamp: '2024-11-25 10:00', remarks: '',                              fromStatus: 'Draft',        toStatus: 'Submitted'    },
        { action: 'Review Started',  performedBy: 'tax_off_01',   role: 'TAX_OFFICER',       timestamp: '2024-11-26 09:00', remarks: 'All income sources verified',    fromStatus: 'Submitted',    toStatus: 'Under Review' },
        { action: 'Return Accepted', performedBy: 'tax_comm_01',  role: 'TAX_COMMISSIONER',  timestamp: '2024-11-28 14:00', remarks: 'Return verified and accepted',   fromStatus: 'Under Review', toStatus: 'Accepted'     }
      ]
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
      withholdingTax: 200000, taxPaid: 375000, refundable: 0,
      submissionDate: '2024-11-28', dueDate: '2024-11-30',
      status: 'Accepted', submittedBy: 'Tax Officer',
      verifiedBy: 'Tax Commissioner', remarks: '',
      actionHistory: [
        { action: 'Return Filed',    performedBy: 'tax_off_01',   role: 'TAX_OFFICER',       timestamp: '2024-11-28 10:00', remarks: '',                              fromStatus: 'Draft',        toStatus: 'Submitted'    },
        { action: 'Return Accepted', performedBy: 'tax_comm_01',  role: 'TAX_COMMISSIONER',  timestamp: '2024-11-29 11:00', remarks: 'Large company — verified',      fromStatus: 'Submitted',    toStatus: 'Accepted'     }
      ]
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
      withholdingTax: 45000, taxPaid: 45000, refundable: 5000,
      submissionDate: '2024-11-30', dueDate: '2024-11-30',
      status: 'Under Review', submittedBy: 'Taxpayer',
      verifiedBy: '', remarks: 'Refund claim under review',
      actionHistory: [
        { action: 'Return Filed',   performedBy: 'taxpayer_01', role: 'TAXPAYER',    timestamp: '2024-11-30 09:00', remarks: '',                       fromStatus: 'Draft',     toStatus: 'Submitted'    },
        { action: 'Review Started', performedBy: 'tax_off_01',  role: 'TAX_OFFICER', timestamp: '2024-11-30 14:00', remarks: 'Refund claim — verify',  fromStatus: 'Submitted', toStatus: 'Under Review' }
      ]
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
      withholdingTax: 100000, taxPaid: 400000, refundable: 0,
      submissionDate: '', dueDate: '2024-11-30',
      status: 'Overdue', submittedBy: '',
      verifiedBy: '', remarks: 'Not yet filed',
      actionHistory: []
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
      withholdingTax: 300000, taxPaid: 1500000, refundable: 0,
      submissionDate: '2024-11-20', dueDate: '2024-11-30',
      status: 'Submitted', submittedBy: 'Tax Officer',
      verifiedBy: '', remarks: 'Pending review',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-11-20 11:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' }
      ]
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
      withholdingTax: 0, taxPaid: 0, refundable: 0,
      submissionDate: '2024-11-15', dueDate: '2024-11-30',
      status: 'Accepted', submittedBy: 'Taxpayer',
      verifiedBy: 'Tax Officer', remarks: 'Zero tax - exempt income',
      actionHistory: [
        { action: 'Return Filed',    performedBy: 'taxpayer_01', role: 'TAXPAYER',         timestamp: '2024-11-15 10:00', remarks: '',                     fromStatus: 'Draft',        toStatus: 'Submitted' },
        { action: 'Return Accepted', performedBy: 'tax_off_01',  role: 'TAX_OFFICER',      timestamp: '2024-11-16 09:00', remarks: 'Zero tax — verified',  fromStatus: 'Submitted',    toStatus: 'Accepted'  }
      ]
    },
    {
      id: 7, returnNo: 'ITR-2024-00007',
      tinNumber: 'TIN-1007', taxpayerName: 'Dhaka Pharma Co.',
      itrCategory: 'Company', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 3000000, exemptIncome: 0,
      taxableIncome: 3000000, taxRate: 25,
      grossTax: 750000, taxRebate: 0,
      netTaxPayable: 750000, advanceTaxPaid: 400000,
      withholdingTax: 100000, taxPaid: 0, refundable: 0,
      submissionDate: '2024-11-22', dueDate: '2024-11-30',
      status: 'Rejected', submittedBy: 'Tax Officer',
      verifiedBy: '', remarks: '',
      actionHistory: [
        { action: 'Return Filed',    performedBy: 'tax_off_01',  role: 'TAX_OFFICER',      timestamp: '2024-11-22 10:00', remarks: '',                                          fromStatus: 'Draft',        toStatus: 'Submitted'    },
        { action: 'Review Started',  performedBy: 'tax_off_01',  role: 'TAX_OFFICER',      timestamp: '2024-11-23 09:00', remarks: '',                                          fromStatus: 'Submitted',    toStatus: 'Under Review' },
        { action: 'Return Rejected', performedBy: 'tax_comm_01', role: 'TAX_COMMISSIONER', timestamp: '2024-11-24 14:00', remarks: 'Revenue discrepancy — audit docs needed',  fromStatus: 'Under Review', toStatus: 'Rejected'     }
      ]
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
    return this.returns.filter(r => {
      const matchSearch = !this.searchTerm ||
        r.returnNo.toLowerCase().includes(this.searchTerm.toLowerCase())     ||
        r.taxpayerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.tinNumber.toLowerCase().includes(this.searchTerm.toLowerCase())    ||
        r.itrCategory.toLowerCase().includes(this.searchTerm.toLowerCase())  ||
        r.assessmentYear.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus = !this.filterStatus || r.status === this.filterStatus;

      return matchSearch && matchStatus;
    });
  }

  countByStatus(status: string): number {
    if (!status) return this.returns.length;
    return this.returns.filter(r => r.status === status).length;
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft':        'status-draft',
      'Submitted':    'status-pending',
      'Under Review': 'status-review',
      'Accepted':     'status-active',
      'Rejected':     'status-suspended',
      'Overdue':      'status-overdue',
      'Amended':      'status-amended',
      'Send Back':    'status-sendback'
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