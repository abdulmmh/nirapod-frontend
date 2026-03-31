import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Penalty } from '../../../../models/penalty.model';

@Component({
  selector: 'app-penalty-list',
  templateUrl: './penalty-list.component.html',
  styleUrls: ['./penalty-list.component.css']
})
export class PenaltyListComponent implements OnInit {

  penalties: Penalty[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: Penalty[] = [
    {
      id: 1, penaltyNo: 'PEN-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      penaltyType: 'Late Filing', severity: 'Medium',
      penaltyAmount: 25000, interestAmount: 3750, totalAmount: 28750,
      paidAmount: 28750, returnNo: 'VAT-2024-00001',
      assessmentYear: '2024-25',
      issueDate: '2024-03-01', dueDate: '2024-03-31',
      paymentDate: '2024-03-28',
      status: 'Paid', issuedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner',
      description: 'Late filing of VAT return for Jan 2024',
      remarks: ''
    },
    {
      id: 2, penaltyNo: 'PEN-2024-00002',
      tinNumber: 'TIN-1002', taxpayerName: 'Karim Traders',
      penaltyType: 'Late Payment', severity: 'Low',
      penaltyAmount: 12000, interestAmount: 1800, totalAmount: 13800,
      paidAmount: 0, returnNo: 'ITR-2024-00002',
      assessmentYear: '2024-25',
      issueDate: '2024-03-05', dueDate: '2024-04-05',
      paymentDate: '',
      status: 'Pending', issuedBy: 'Tax Officer',
      approvedBy: '',
      description: 'Late payment of income tax installment',
      remarks: 'Payment due April 5'
    },
    {
      id: 3, penaltyNo: 'PEN-2024-00003',
      tinNumber: 'TIN-1003', taxpayerName: 'Dhaka Pharma Co.',
      penaltyType: 'Non-Compliance', severity: 'High',
      penaltyAmount: 150000, interestAmount: 22500, totalAmount: 172500,
      paidAmount: 0, returnNo: '',
      assessmentYear: '2024-25',
      issueDate: '2024-03-10', dueDate: '2024-04-10',
      paymentDate: '',
      status: 'Issued', issuedBy: 'Tax Commissioner',
      approvedBy: 'Tax Commissioner',
      description: 'Failure to maintain proper VAT records',
      remarks: 'Legal notice served'
    },
    {
      id: 4, penaltyNo: 'PEN-2024-00004',
      tinNumber: 'TIN-1004', taxpayerName: 'Chittagong Exports',
      penaltyType: 'Underpayment', severity: 'Medium',
      penaltyAmount: 45000, interestAmount: 6750, totalAmount: 51750,
      paidAmount: 25000, returnNo: 'VAT-2024-00004',
      assessmentYear: '2024-25',
      issueDate: '2024-03-12', dueDate: '2024-04-12',
      paymentDate: '',
      status: 'Appealed', issuedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner',
      description: 'Underpayment of VAT for Feb 2024',
      remarks: 'Appeal filed on Mar 20'
    },
    {
      id: 5, penaltyNo: 'PEN-2024-00005',
      tinNumber: 'TIN-1005', taxpayerName: 'Sylhet Tea House',
      penaltyType: 'Fraud', severity: 'Critical',
      penaltyAmount: 500000, interestAmount: 75000, totalAmount: 575000,
      paidAmount: 0, returnNo: 'ITR-2024-00005',
      assessmentYear: '2024-25',
      issueDate: '2024-03-15', dueDate: '2024-03-25',
      paymentDate: '',
      status: 'Overdue', issuedBy: 'Tax Commissioner',
      approvedBy: 'Tax Commissioner',
      description: 'Fraudulent tax return submission',
      remarks: 'Case referred to legal department'
    },
    {
      id: 6, penaltyNo: 'PEN-2024-00006',
      tinNumber: 'TIN-1006', taxpayerName: 'BD Tech Solutions',
      penaltyType: 'Late Filing', severity: 'Low',
      penaltyAmount: 8000, interestAmount: 1200, totalAmount: 9200,
      paidAmount: 9200, returnNo: 'VAT-2024-00006',
      assessmentYear: '2024-25',
      issueDate: '2024-03-18', dueDate: '2024-04-18',
      paymentDate: '2024-03-30',
      status: 'Waived', issuedBy: 'Tax Officer',
      approvedBy: 'Tax Commissioner',
      description: 'Late filing — first offence waiver applied',
      remarks: 'Waived on first offence basis'
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Penalty[]>(API_ENDPOINTS.PENALTIES.LIST).subscribe({
      next: data => { this.penalties = data;           this.isLoading = false; },
      error: ()   => { this.penalties = this.fallback; this.isLoading = false; }
    });
  }

  get filteredPenalties(): Penalty[] {
    if (!this.searchTerm.trim()) return this.penalties;
    const term = this.searchTerm.toLowerCase();
    return this.penalties.filter(p =>
      p.penaltyNo.toLowerCase().includes(term)      ||
      p.taxpayerName.toLowerCase().includes(term)   ||
      p.tinNumber.toLowerCase().includes(term)      ||
      p.penaltyType.toLowerCase().includes(term)    ||
      p.assessmentYear.toLowerCase().includes(term)
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Issued':   'status-issued',
      'Pending':  'status-pending',
      'Paid':     'status-active',
      'Waived':   'status-waived',
      'Appealed': 'status-appealed',
      'Overdue':  'status-overdue'
    };
    return map[status] ?? '';
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      'Low':      'sev-low',
      'Medium':   'sev-medium',
      'High':     'sev-high',
      'Critical': 'sev-critical'
    };
    return map[severity] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'Late Filing':     'type-late',
      'Late Payment':    'type-late',
      'Non-Compliance':  'type-noncompliance',
      'Fraud':           'type-fraud',
      'Underpayment':    'type-under',
      'Other':           'type-other'
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }

  viewPenalty(id: number): void {
    this.router.navigate(['/penalties','view' ,id]);
  }

  editPenalty(id: number): void {
    this.router.navigate(['/penalties', 'edit', id]);
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this penalty?')) return;
    this.http.delete(`${API_ENDPOINTS.PENALTIES.LIST}/${id}`).subscribe({
      next: () => { this.penalties = this.penalties.filter(p => p.id !== id); },
      error: ()  => { this.penalties = this.penalties.filter(p => p.id !== id); }
    });
  }
}