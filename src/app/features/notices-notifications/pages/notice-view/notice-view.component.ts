import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Notice } from '../../../../models/notice.model';

@Component({
  selector: 'app-notice-view',
  templateUrl: './notice-view.component.html',
  styleUrls: ['./notice-view.component.css']
})
export class NoticeViewComponent implements OnInit {

  notice: Notice | null = null;
  isLoading    = true;
  responseNote = '';
  showResponse = false;

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
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Notice>(API_ENDPOINTS.NOTICES.GET(id)).subscribe({
      next: (data) => {
        this.notice = data;
        this.isLoading = false;
        this.markAsReadIfNeeded();
      },
      error: () => {
        this.notice = this.fallback.find(n => n.id === id) || this.fallback[0];
        this.isLoading = false;
        this.markAsReadIfNeeded();
      }
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Unread': 'status-unread', 'Read': 'status-read',
      'Responded': 'status-active', 'Expired': 'status-inactive',
      'Cancelled': 'status-suspended'
    };
    return map[s] ?? '';
  }

  getPriorityClass(p: string): string {
    const map: Record<string, string> = {
      'Low': 'pri-low', 'Normal': 'pri-normal',
      'High': 'pri-high', 'Urgent': 'pri-urgent'
    };
    return map[p] ?? '';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'General': 'bi bi-info-circle-fill', 'Tax Due': 'bi bi-cash-coin',
      'Audit Notice': 'bi bi-shield-fill-check', 'Penalty Notice': 'bi bi-exclamation-triangle-fill',
      'Compliance': 'bi bi-patch-check-fill', 'Refund Update': 'bi bi-cash-stack',
      'System': 'bi bi-gear-fill', 'Reminder': 'bi bi-bell-fill'
    };
    return map[type] ?? 'bi bi-bell-fill';
  }

  submitResponse(): void {
    if (!this.responseNote.trim() || !this.notice) return;
    const responseDate = new Date().toISOString().split('T')[0];
    const updatedNotice: Notice = {
      ...this.notice,
      status: 'Responded',
      responseNote: this.responseNote.trim(),
      responseDate
    };

    this.http.put<Notice>(API_ENDPOINTS.NOTICES.UPDATE(this.notice.id), updatedNotice).subscribe({
      next: (data) => {
        this.notice = data ?? updatedNotice;
        this.showResponse = false;
        this.responseNote = '';
      },
      error: () => {
        // Fallback keeps UI usable before backend is ready.
        this.notice = updatedNotice;
        this.showResponse = false;
        this.responseNote = '';
      }
    });
  }

  onBack(): void { this.router.navigate(['/notices']); }

  private markAsReadIfNeeded(): void {
    if (!this.notice || this.notice.status !== 'Unread') return;

    const readDate = new Date().toISOString().split('T')[0];
    const updatedNotice: Notice = {
      ...this.notice,
      status: 'Read',
      readDate
    };

    this.notice = updatedNotice;
    this.http.put(API_ENDPOINTS.NOTICES.UPDATE(this.notice.id), updatedNotice).subscribe({
      next: () => {},
      error: () => {}
    });
  }
}