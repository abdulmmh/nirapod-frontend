import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Notice, NoticeListResponse } from '../../../../models/notice.model';
import { AuthService } from '../../../../core/services/auth.service'; // ✅ ADD
import { Role } from '../../../../core/constants/roles.constants'; // ✅ ADD

@Component({
  selector: 'app-notice-view',
  templateUrl: './notice-view.component.html',
  styleUrls: ['./notice-view.component.css'],
})
export class NoticeViewComponent implements OnInit {
  notice: Notice | null = null;
  isLoading = true;
  responseNote = '';
  showResponse = false;

  isOfficerRole = false;
  isTaxpayerRole = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.isOfficerRole =
      this.auth.hasRole(Role.TAX_OFFICER) ||
      this.auth.hasRole(Role.TAX_COMMISSIONER) ||
      this.auth.hasRole(Role.SUPER_ADMIN);
    this.isTaxpayerRole =
      this.auth.hasRole(Role.TAXPAYER) && !this.isOfficerRole;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Notice>(API_ENDPOINTS.NOTICES.GET(id)).subscribe({
      next: (data) => {
        this.notice = data;
        this.isLoading = false;
        this.markAsReadIfNeeded();
      },
      error: () => {
        this.isLoading = false;
        this.toast.error('Failed to load notice details.');
      },
    });
  }

  submitResponse(): void {
    if (!this.responseNote.trim() || !this.notice) return;

    this.http
      .patch<Notice>(API_ENDPOINTS.NOTICES.RESPOND(this.notice.id), {
        responseNote: this.responseNote.trim(),
      })
      .subscribe({
        next: () => {
          this.notice = {
            ...this.notice!,
            status: 'Responded',
            responseNote: this.responseNote.trim(),
            responseDate: new Date().toISOString().split('T')[0],
          };
          this.showResponse = false;
          this.responseNote = '';
          this.toast.success('Response submitted successfully.');
        },
        error: () => this.toast.error('Failed to submit response.'),
      });
  }

  onBack(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(
        this.router.url.includes('/my-portal')
          ? ['/my-portal/notices']
          : ['/notices'],
      );
    }
  }

  private markAsReadIfNeeded(): void {
    if (!this.isTaxpayerRole) return; // ← officer/admin skip
    if (!this.notice || this.notice.status !== 'Unread') return;

    const id = this.notice.id;
    this.notice = { ...this.notice, status: 'Read' };
    this.http
      .patch(API_ENDPOINTS.NOTICES.READ(id), {})
      .subscribe({ next: () => {}, error: () => {} });
  }

  getStatusClass = (s: string) =>
    ({
      Unread: 'status-unread',
      Read: 'status-read',
      Responded: 'status-active',
      Expired: 'status-inactive',
    })[s] ?? '';
  getPriorityClass = (p: string) =>
    ({
      Low: 'pri-low',
      Normal: 'pri-normal',
      High: 'pri-high',
      Urgent: 'pri-urgent',
    })[p] ?? '';
  getTypeIcon = (t: string) =>
    ({
      General: 'bi bi-info-circle-fill',
      'Tax Due': 'bi bi-cash-coin',
      'Audit Notice': 'bi bi-shield-fill-check',
      'Penalty Notice': 'bi bi-exclamation-triangle-fill',
      Compliance: 'bi bi-patch-check-fill',
      'Refund Update': 'bi bi-cash-stack',
      System: 'bi bi-gear-fill',
      Reminder: 'bi bi-bell-fill',
    })[t] ?? 'bi bi-bell-fill';
}
