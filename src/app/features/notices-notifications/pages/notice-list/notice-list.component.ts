import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Notice } from '../../../../models/notice.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/constants/roles.constants';

@Component({
  selector: 'app-notice-list',
  templateUrl: './notice-list.component.html',
  styleUrls: ['./notice-list.component.css']
})
export class NoticeListComponent implements OnInit {

  notices: Notice[] = [];
  searchTerm    = '';
  isLoading     = false;
  activeFilter  = 'All';

  filters = ['All', 'Unread', 'Read', 'Responded', 'Urgent', 'Expired'];

  Role = Role;

  private fallback: Notice[] = [
    {
      id: 1, noticeNo: 'NOT-2024-00001',
      subject: 'VAT Return Due Reminder — January 2024',
      body: 'Dear Taxpayer, your VAT return for January 2024 is due by February 15, 2024. Please submit your return to avoid penalties.',
      noticeType: 'Reminder', priority: 'High',
      targetType: 'Specific Taxpayer',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      issuedBy: 'Tax Officer', issuedDate: '2024-02-01',
      dueDate: '2024-02-15', readDate: '2024-02-02',
      responseDate: '', responseNote: '',
      attachmentName: '', status: 'Read'
    },
    {
      id: 2, noticeNo: 'NOT-2024-00002',
      subject: 'Penalty Notice — Late Filing',
      body: 'This notice is issued for late filing of VAT return. A penalty of BDT 25,000 has been imposed. Please pay within 30 days.',
      noticeType: 'Penalty Notice', priority: 'Urgent',
      targetType: 'Specific Taxpayer',
      tinNumber: 'TIN-1002', taxpayerName: 'Karim Traders',
      issuedBy: 'Tax Commissioner', issuedDate: '2024-03-01',
      dueDate: '2024-03-31', readDate: '',
      responseDate: '', responseNote: '',
      attachmentName: 'penalty_notice.pdf', status: 'Unread'
    },
    {
      id: 3, noticeNo: 'NOT-2024-00003',
      subject: 'Audit Scheduled — Full Audit Notice',
      body: 'Your account has been selected for a full audit. Please prepare all relevant documents for the audit scheduled on March 15, 2024.',
      noticeType: 'Audit Notice', priority: 'High',
      targetType: 'Specific Taxpayer',
      tinNumber: 'TIN-1003', taxpayerName: 'Dhaka Pharma Co.',
      issuedBy: 'Tax Commissioner', issuedDate: '2024-03-05',
      dueDate: '2024-03-15', readDate: '2024-03-06',
      responseDate: '2024-03-08', responseNote: 'Documents will be prepared.',
      attachmentName: 'audit_schedule.pdf', status: 'Responded'
    },
    {
      id: 4, noticeNo: 'NOT-2024-00004',
      subject: 'Income Tax Filing Deadline — FY 2023-24',
      body: 'This is a reminder that the income tax return filing deadline for FY 2023-24 is November 30, 2024. Please file your return on time.',
      noticeType: 'Tax Due', priority: 'Normal',
      targetType: 'All Taxpayers',
      tinNumber: '', taxpayerName: 'All Taxpayers',
      issuedBy: 'NBR', issuedDate: '2024-10-01',
      dueDate: '2024-11-30', readDate: '',
      responseDate: '', responseNote: '',
      attachmentName: '', status: 'Unread'
    },
    {
      id: 5, noticeNo: 'NOT-2024-00005',
      subject: 'Refund Approved — VAT Refund Processed',
      body: 'Your VAT refund claim of BDT 85,000 has been approved and will be transferred to your account within 7 working days.',
      noticeType: 'Refund Update', priority: 'Normal',
      targetType: 'Specific Taxpayer',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      issuedBy: 'Tax Officer', issuedDate: '2024-04-05',
      dueDate: '', readDate: '2024-04-06',
      responseDate: '', responseNote: '',
      attachmentName: '', status: 'Read'
    },
    {
      id: 6, noticeNo: 'NOT-2024-00006',
      subject: 'System Maintenance — Portal Downtime Notice',
      body: 'The NBR tax portal will be under maintenance on April 10, 2024 from 2:00 AM to 6:00 AM. Please plan accordingly.',
      noticeType: 'System', priority: 'Low',
      targetType: 'All Users',
      tinNumber: '', taxpayerName: 'All Users',
      issuedBy: 'System Admin', issuedDate: '2024-04-08',
      dueDate: '', readDate: '2024-04-08',
      responseDate: '', responseNote: '',
      attachmentName: '', status: 'Read'
    },
    {
      id: 7, noticeNo: 'NOT-2024-00007',
      subject: 'Compliance Notice — Record Keeping Requirements',
      body: 'All registered businesses are required to maintain proper VAT records for a minimum of 5 years as per NBR regulations.',
      noticeType: 'Compliance', priority: 'Normal',
      targetType: 'All Taxpayers',
      tinNumber: '', taxpayerName: 'All Taxpayers',
      issuedBy: 'NBR', issuedDate: '2024-04-10',
      dueDate: '2024-05-10', readDate: '',
      responseDate: '', responseNote: '',
      attachmentName: 'compliance_guide.pdf', status: 'Unread'
    },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<Notice[]>(API_ENDPOINTS.NOTICES.LIST).subscribe({
      next: data => { this.notices = data;           this.isLoading = false; },
      error: ()   => { this.notices = this.fallback; this.isLoading = false; }
    });
  }

  get filteredNotices(): Notice[] {
    let result = this.notices;

    // Filter by tab
    if (this.activeFilter !== 'All') {
      if (this.activeFilter === 'Urgent') {
        result = result.filter(n => n.priority === 'Urgent');
      } else {
        result = result.filter(n => n.status === this.activeFilter);
      }
    }

    // Filter by search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(n =>
        n.noticeNo.toLowerCase().includes(term)     ||
        n.subject.toLowerCase().includes(term)      ||
        n.taxpayerName.toLowerCase().includes(term) ||
        n.noticeType.toLowerCase().includes(term)
      );
    }

    return result;
  }

  get unreadCount(): number {
    return this.notices.filter(n => n.status === 'Unread').length;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Unread':    'status-unread',
      'Read':      'status-read',
      'Responded': 'status-active',
      'Expired':   'status-inactive',
      'Cancelled': 'status-suspended'
    };
    return map[status] ?? '';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'Low':    'pri-low',
      'Normal': 'pri-normal',
      'High':   'pri-high',
      'Urgent': 'pri-urgent'
    };
    return map[priority] ?? '';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'General':        'bi bi-info-circle-fill',
      'Tax Due':        'bi bi-cash-coin',
      'Audit Notice':   'bi bi-shield-fill-check',
      'Penalty Notice': 'bi bi-exclamation-triangle-fill',
      'Compliance':     'bi bi-patch-check-fill',
      'Refund Update':  'bi bi-cash-stack',
      'System':         'bi bi-gear-fill',
      'Reminder':       'bi bi-bell-fill'
    };
    return map[type] ?? 'bi bi-bell-fill';
  }

  getTypeColor(type: string): string {
    const map: Record<string, string> = {
      'General':        'type-general',
      'Tax Due':        'type-taxdue',
      'Audit Notice':   'type-audit',
      'Penalty Notice': 'type-penalty',
      'Compliance':     'type-compliance',
      'Refund Update':  'type-refund',
      'System':         'type-system',
      'Reminder':       'type-reminder'
    };
    return map[type] ?? '';
  }

  viewNotice(id: number): void { this.router.navigate(['/notices', id]); }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    this.notices = this.notices.filter(n => n.id !== id);
  }
}