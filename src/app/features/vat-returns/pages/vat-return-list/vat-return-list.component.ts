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
  searchTerm   = '';
  filterStatus = '';
  isLoading    = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  statuses = [
    '', 'Draft', 'Submitted', 'Under Review',
    'Accepted', 'Rejected', 'Overdue', 'Amended', 'Send Back'
  ];

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
      submittedBy: 'Taxpayer', remarks: '',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'taxpayer_01', role: 'TAXPAYER', timestamp: '2024-02-12 10:30', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' },
        { action: 'Review Started', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-02-13 09:00', remarks: 'All documents verified', fromStatus: 'Submitted', toStatus: 'Under Review' },
        { action: 'Return Accepted', performedBy: 'tax_comm_01', role: 'TAX_COMMISSIONER', timestamp: '2024-02-14 14:00', remarks: 'Return is accurate and complete', fromStatus: 'Under Review', toStatus: 'Accepted' }
      ]
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
      submittedBy: 'Taxpayer', remarks: 'Late submission',
      actionHistory: []
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
      assessmentYear: '2024-25', status: 'Under Review',
      submittedBy: 'Tax Officer', remarks: 'Large export claim - needs review',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-03-14 11:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' },
        { action: 'Review Started', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-03-15 09:30', remarks: 'Large export claim - needs review', fromStatus: 'Submitted', toStatus: 'Under Review' }
      ]
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
      submittedBy: 'Taxpayer', remarks: '',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'taxpayer_01', role: 'TAXPAYER', timestamp: '2024-04-10 15:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' }
      ]
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
      submittedBy: '', remarks: '',
      actionHistory: []
    },
    {
      id: 6, returnNo: 'VRT-2024-00006',
      binNo: 'BIN-2024-001002', tinNumber: 'TIN-1002',
      businessName: 'Karim Traders',
      returnPeriod: 'Monthly', periodMonth: 'March', periodYear: '2024',
      taxableSupplies: 130000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 130000, outputTax: 19500, inputTax: 9000,
      netTaxPayable: 10500, taxPaid: 0,
      submissionDate: '2024-04-05', dueDate: '2024-04-15',
      assessmentYear: '2024-25', status: 'Rejected',
      submittedBy: 'Taxpayer', remarks: '',
      actionHistory: [
        { action: 'Return Filed', performedBy: 'taxpayer_01', role: 'TAXPAYER', timestamp: '2024-04-05 10:00', remarks: '', fromStatus: 'Draft', toStatus: 'Submitted' },
        { action: 'Review Started', performedBy: 'tax_off_01', role: 'TAX_OFFICER', timestamp: '2024-04-06 09:00', remarks: '', fromStatus: 'Submitted', toStatus: 'Under Review' },
        { action: 'Return Rejected', performedBy: 'tax_comm_01', role: 'TAX_COMMISSIONER', timestamp: '2024-04-07 11:00', remarks: 'Input tax claim mismatch — supporting docs required', fromStatus: 'Under Review', toStatus: 'Rejected' }
      ]
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<VatReturn[]>(API_ENDPOINTS.VAT_RETURNS.LIST).subscribe({
      next: data => { this.returns = data;           this.isLoading = false; },
      error: ()   => { this.returns = this.fallback; this.isLoading = false; }
    });
  }

  get filtered(): VatReturn[] {
    return this.returns.filter(r => {
      const matchSearch = !this.searchTerm ||
        r.returnNo.toLowerCase().includes(this.searchTerm.toLowerCase())     ||
        r.businessName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.tinNumber.toLowerCase().includes(this.searchTerm.toLowerCase())    ||
        r.binNo.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus = !this.filterStatus || r.status === this.filterStatus;

      return matchSearch && matchStatus;
    });
  }

  // Status counts for tabs
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

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }

  view(id: number): void { this.router.navigate(['/vat-returns/view', id]); }
  edit(id: number): void { this.router.navigate(['/vat-returns/edit', id]); }

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
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
    this.returns = this.returns.filter(r => r.id !== id);
  }
}
