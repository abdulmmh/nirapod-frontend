import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Audit } from '../../../../models/audit.model';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.css']
})
export class AuditListComponent implements OnInit {

  audits: Audit[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: Audit[] = [
    {
      id: 1, auditNo: 'AUD-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      auditType: 'VAT Audit', priority: 'High',
      assessmentYear: '2024-25', returnNo: 'VAT-2024-00001',
      scheduledDate: '2024-03-01', startDate: '2024-03-05',
      completionDate: '2024-03-20',
      assignedTo: 'Auditor Rahim', supervisedBy: 'Tax Commissioner',
      auditFindings: 'Minor discrepancies found in VAT records',
      taxDemand: 45000, penaltyRecommended: 12000,
      status: 'Completed', remarks: 'Taxpayer notified'
    },
    {
      id: 2, auditNo: 'AUD-2024-00002',
      tinNumber: 'TIN-1002', taxpayerName: 'Karim Traders',
      auditType: 'Income Tax Audit', priority: 'Medium',
      assessmentYear: '2024-25', returnNo: 'ITR-2024-00002',
      scheduledDate: '2024-03-10', startDate: '2024-03-12',
      completionDate: '',
      assignedTo: 'Auditor Kamal', supervisedBy: 'Tax Commissioner',
      auditFindings: '',
      taxDemand: 0, penaltyRecommended: 0,
      status: 'In Progress', remarks: 'Documents under review'
    },
    {
      id: 3, auditNo: 'AUD-2024-00003',
      tinNumber: 'TIN-1003', taxpayerName: 'Dhaka Pharma Co.',
      auditType: 'Full Audit', priority: 'Critical',
      assessmentYear: '2024-25', returnNo: '',
      scheduledDate: '2024-03-15', startDate: '',
      completionDate: '',
      assignedTo: 'Auditor Nasrin', supervisedBy: 'Tax Commissioner',
      auditFindings: '',
      taxDemand: 0, penaltyRecommended: 0,
      status: 'Flagged', remarks: 'Suspected tax evasion'
    },
    {
      id: 4, auditNo: 'AUD-2024-00004',
      tinNumber: 'TIN-1004', taxpayerName: 'Chittagong Exports',
      auditType: 'Desk Audit', priority: 'Low',
      assessmentYear: '2024-25', returnNo: 'VAT-2024-00004',
      scheduledDate: '2024-03-20', startDate: '',
      completionDate: '',
      assignedTo: 'Auditor Faruk', supervisedBy: 'Tax Commissioner',
      auditFindings: '',
      taxDemand: 0, penaltyRecommended: 0,
      status: 'Scheduled', remarks: ''
    },
    {
      id: 5, auditNo: 'AUD-2024-00005',
      tinNumber: 'TIN-1005', taxpayerName: 'Sylhet Tea House',
      auditType: 'Field Audit', priority: 'High',
      assessmentYear: '2024-25', returnNo: 'ITR-2024-00005',
      scheduledDate: '2024-03-25', startDate: '2024-03-26',
      completionDate: '',
      assignedTo: 'Auditor Imran', supervisedBy: 'Tax Commissioner',
      auditFindings: 'Incomplete records found',
      taxDemand: 125000, penaltyRecommended: 35000,
      status: 'Flagged', remarks: 'Legal notice issued'
    },
    {
      id: 6, auditNo: 'AUD-2024-00006',
      tinNumber: 'TIN-1006', taxpayerName: 'BD Tech Solutions',
      auditType: 'Special Audit', priority: 'Medium',
      assessmentYear: '2024-25', returnNo: 'VAT-2024-00006',
      scheduledDate: '2024-04-01', startDate: '',
      completionDate: '',
      assignedTo: 'Auditor Reza', supervisedBy: 'Tax Commissioner',
      auditFindings: '',
      taxDemand: 0, penaltyRecommended: 0,
      status: 'Pending', remarks: 'Awaiting assignment confirmation'
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Audit[]>(API_ENDPOINTS.AUDITS.LIST).subscribe({
      next: data => { this.audits = data;           this.isLoading = false; },
      error: ()   => { this.audits = this.fallback; this.isLoading = false; }
    });
  }

  get filteredAudits(): Audit[] {
    if (!this.searchTerm.trim()) return this.audits;
    const term = this.searchTerm.toLowerCase();
    return this.audits.filter(a =>
      a.auditNo.toLowerCase().includes(term)       ||
      a.taxpayerName.toLowerCase().includes(term)  ||
      a.tinNumber.toLowerCase().includes(term)     ||
      a.auditType.toLowerCase().includes(term)     ||
      a.assignedTo.toLowerCase().includes(term)
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Scheduled':   'status-scheduled',
      'In Progress': 'status-progress',
      'Completed':   'status-active',
      'Flagged':     'status-flagged',
      'Cancelled':   'status-inactive',
      'Pending':     'status-pending'
    };
    return map[status] ?? '';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'Low':      'pri-low',
      'Medium':   'pri-medium',
      'High':     'pri-high',
      'Critical': 'pri-critical'
    };
    return map[priority] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VAT Audit':        'type-vat',
      'Income Tax Audit': 'type-it',
      'Full Audit':       'type-full',
      'Desk Audit':       'type-desk',
      'Field Audit':      'type-field',
      'Special Audit':    'type-special'
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount === 0) return '—';
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }

  viewAudit(id: number): void   { this.router.navigate(['/audits', id]); }
  editAudit(id: number): void   { this.router.navigate(['/audits', id, 'edit']); }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this audit?')) return;
    this.http.delete(API_ENDPOINTS.AUDITS.GET(id)).subscribe({
      next: () => { this.audits = this.audits.filter(a => a.id !== id); },
      error: ()  => { this.audits = this.audits.filter(a => a.id !== id); }
    });
  }
}