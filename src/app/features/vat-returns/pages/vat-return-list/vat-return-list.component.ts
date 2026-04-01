import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatReturn } from '../../../../models/vat-return.model';

@Component({
  selector: 'app-vat-return-list',
  templateUrl: './vat-return-list.component.html',
  styleUrls: ['./vat-return-list.component.css']
})
export class VatReturnListComponent implements OnInit {

  returns: VatReturn[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: VatReturn[] = [
    {
      id: 1, returnNo: 'VRT-2024-00001',
      binNo: 'BIN-2024-001001', tinNumber: 'TIN-1001',
      businessName: 'Rahman Textile Ltd.',
      returnPeriod: 'Monthly', periodMonth: 'January', periodYear: '2024',
      taxableSupplies: 500000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 500000, outputTax: 75000, inputTax: 30000,
      netTaxPayable: 45000, taxPaid: 45000,
      submissionDate: '2024-02-12', dueDate: '2024-02-15',
      assessmentYear: '2024-25', status: 'Accepted',
      submittedBy: 'Taxpayer', remarks: ''
    },
    {
      id: 2, returnNo: 'VRT-2024-00002',
      binNo: 'BIN-2024-001002', tinNumber: 'TIN-1002',
      businessName: 'Karim Traders',
      returnPeriod: 'Monthly', periodMonth: 'January', periodYear: '2024',
      taxableSupplies: 120000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 120000, outputTax: 18000, inputTax: 8000,
      netTaxPayable: 10000, taxPaid: 0,
      submissionDate: '2024-02-18', dueDate: '2024-02-15',
      assessmentYear: '2024-25', status: 'Overdue',
      submittedBy: 'Taxpayer', remarks: 'Late submission'
    },
    {
      id: 3, returnNo: 'VRT-2024-00003',
      binNo: 'BIN-2024-001004', tinNumber: 'TIN-1004',
      businessName: 'Chittagong Exports',
      returnPeriod: 'Monthly', periodMonth: 'February', periodYear: '2024',
      taxableSupplies: 800000, exemptSupplies: 0, zeroRatedSupplies: 200000,
      totalSupplies: 1000000, outputTax: 120000, inputTax: 55000,
      netTaxPayable: 65000, taxPaid: 65000,
      submissionDate: '2024-03-14', dueDate: '2024-03-15',
      assessmentYear: '2024-25', status: 'Accepted',
      submittedBy: 'Tax Officer', remarks: ''
    },
    {
      id: 4, returnNo: 'VRT-2024-00004',
      binNo: 'BIN-2024-001006', tinNumber: 'TIN-1006',
      businessName: 'BD Tech Solutions',
      returnPeriod: 'Quarterly', periodMonth: 'Q1', periodYear: '2024',
      taxableSupplies: 650000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 650000, outputTax: 97500, inputTax: 40000,
      netTaxPayable: 57500, taxPaid: 0,
      submissionDate: '2024-04-10', dueDate: '2024-04-15',
      assessmentYear: '2024-25', status: 'Submitted',
      submittedBy: 'Taxpayer', remarks: 'Under review'
    },
    {
      id: 5, returnNo: 'VRT-2024-00005',
      binNo: 'BIN-2024-001001', tinNumber: 'TIN-1001',
      businessName: 'Rahman Textile Ltd.',
      returnPeriod: 'Monthly', periodMonth: 'February', periodYear: '2024',
      taxableSupplies: 520000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 520000, outputTax: 78000, inputTax: 32000,
      netTaxPayable: 46000, taxPaid: 0,
      submissionDate: '', dueDate: '2024-03-15',
      assessmentYear: '2024-25', status: 'Draft',
      submittedBy: '', remarks: ''
    },
    {
      id: 6, returnNo: 'VRT-2024-00006',
      binNo: 'BIN-2024-001002', tinNumber: 'TIN-1002',
      businessName: 'Karim Traders',
      returnPeriod: 'Monthly', periodMonth: 'February', periodYear: '2024',
      taxableSupplies: 130000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 130000, outputTax: 19500, inputTax: 9000,
      netTaxPayable: 10500, taxPaid: 10500,
      submissionDate: '2024-03-13', dueDate: '2024-03-15',
      assessmentYear: '2024-25', status: 'Accepted',
      submittedBy: 'Taxpayer', remarks: ''
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<VatReturn[]>(API_ENDPOINTS.TAXPAYERS.LIST).subscribe({
      next: data => { this.returns = data;           this.isLoading = false; },
      error: ()   => { this.returns = this.fallback; this.isLoading = false; }
    });
  }

  get filtered(): VatReturn[] {
    if (!this.searchTerm.trim()) return this.returns;
    const term = this.searchTerm.toLowerCase();
    return this.returns.filter(r =>
      r.returnNo.toLowerCase().includes(term)      ||
      r.businessName.toLowerCase().includes(term)  ||
      r.tinNumber.toLowerCase().includes(term)     ||
      r.binNo.toLowerCase().includes(term)         ||
      r.periodMonth.toLowerCase().includes(term)   ||
      r.periodYear.toLowerCase().includes(term)
    );
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft':     'status-draft',
      'Submitted': 'status-pending',
      'Accepted':  'status-active',
      'Rejected':  'status-suspended',
      'Overdue':   'status-overdue',
      'Amended':   'status-amended'
    };
    return map[s] ?? '';
  }

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }

  view(id: number): void { this.router.navigate(['/vat-returns/view', id]); }
  edit(id: number): void { this.router.navigate(['/vat-returns/edit', id]); }

  delete(id: number): void {
    if (!confirm('Delete this VAT return?')) return;
    this.returns = this.returns.filter(r => r.id !== id);
  }
}