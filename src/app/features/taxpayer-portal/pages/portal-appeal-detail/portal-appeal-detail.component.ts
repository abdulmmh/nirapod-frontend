import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppealService } from '../../../appeal-management/service/appeal.service';
import { Appeal } from '../../../appeal-management/model/appeal.model';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-portal-appeal-detail',
  templateUrl: './portal-appeal-detail.component.html',
  styleUrls: ['./portal-appeal-detail.component.css'],
})
export class PortalAppealDetailComponent implements OnInit {
  appeal: Appeal | null = null;
  isLoading = false;
  appealId = 0;

  documents: any[] = [];
  docsLoading = false;
  uploadFile: File | null = null;
  uploadDesc = '';
  isUploading = false;
  uploadError: string | null = null;

  showWithdrawModal = false;
  withdrawReason = '';
  withdrawSubmitting = false;

  constructor(
    private route:         ActivatedRoute,
    private router:        Router,
    private appealService: AppealService,
    private http:          HttpClient,
  ) {}

  ngOnInit(): void {
    this.appealId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.appealService.getMyAppealById(this.appealId).subscribe({
      next: (a) => {
        this.appeal = a;
        this.isLoading = false;
        this.loadDocuments();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/my-portal/appeals']);
      },
    });
  }

  // ── Documents ───────────────────────────────────────────────────────────
  loadDocuments(): void {
    this.docsLoading = true;
    this.http
      .get<any[]>(API_ENDPOINTS.APPEALS.MY_DOCS_LIST(this.appealId))
      .subscribe({
        next: (docs) => { this.documents = docs ?? []; this.docsLoading = false; },
        error: ()    => { this.docsLoading = false; },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFile = input.files?.[0] ?? null;
    this.uploadError = null;
  }

  uploadDocument(): void {
    if (!this.uploadFile) return;
    this.isUploading = true;
    this.uploadError = null;

    const formData = new FormData();
    formData.append('file', this.uploadFile);
    if (this.uploadDesc) formData.append('description', this.uploadDesc);

    this.http
      .post<any>(API_ENDPOINTS.APPEALS.MY_DOCS_UPLOAD(this.appealId), formData)
      .subscribe({
        next: (doc) => {
          this.documents.unshift(doc);
          this.uploadFile = null;
          this.uploadDesc = '';
          this.isUploading = false;
          const input = document.getElementById('docFileInput') as HTMLInputElement;
          if (input) input.value = '';
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadError = err?.error?.message || 'Upload failed. Please try again.';
        },
      });
  }

  deleteDocument(docId: number): void {
    this.http
      .delete(API_ENDPOINTS.APPEALS.MY_DOCS_DELETE(this.appealId, docId))
      .subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== docId);
        },
      });
  }

  canUpload(): boolean {
    return !!this.appeal
      && !['DECIDED', 'CLOSED', 'WITHDRAWN'].includes(this.appeal.status);
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024)         return bytes + ' B';
    if (bytes < 1024 * 1024)  return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileIcon(type: string): string {
    if (!type)                    return 'bi-file-earmark';
    if (type.includes('pdf'))     return 'bi-file-earmark-pdf-fill';
    if (type.includes('image'))   return 'bi-file-earmark-image-fill';
    if (type.includes('word'))    return 'bi-file-earmark-word-fill';
    if (type.includes('sheet') || type.includes('excel'))
                                  return 'bi-file-earmark-excel-fill';
    return 'bi-file-earmark-fill';
  }

  // ── Withdraw ─────────────────────────────────────────────────────────────
  onBack(): void { this.router.navigate(['/my-portal/appeals']); }

  canWithdraw(): boolean {
    return !!this.appeal && ['FILED', 'UNDER_REVIEW'].includes(this.appeal.status);
  }

  submitWithdraw(): void {
    this.withdrawSubmitting = true;
    this.appealService.withdraw(this.appealId, this.withdrawReason).subscribe({
      next: (a) => {
        this.appeal = a;
        this.withdrawSubmitting = false;
        this.showWithdrawModal = false;
      },
      error: () => { this.withdrawSubmitting = false; },
    });
  }

  // ── Decided By ──────────────────────────────────────────────────────────
  get decidedByDisplay(): string {
    if (!this.appeal) return '';
    return (this.appeal as any).decidedByName || this.appeal.decidedBy || '';
  }

  // ── Deadline ────────────────────────────────────────────────────────────
  get appealDeadline(): Date | null {
    if (!this.appeal?.deadline) return null;
    return new Date(this.appeal.deadline);
  }

  get daysUntilDeadline(): number | null {
    if (!this.appealDeadline) return null;
    const diff = this.appealDeadline.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get isDeadlineExpired(): boolean {
    const days = this.daysUntilDeadline;
    return days !== null && days < 0;
  }

  get deadlineWarningClass(): string {
    const days = this.daysUntilDeadline;
    if (days === null) return '';
    if (days < 0)    return 'deadline-expired';
    if (days <= 7)   return 'deadline-urgent';
    if (days <= 14)  return 'deadline-warning';
    return 'deadline-ok';
  }

  get deadlineMessage(): string {
    const days = this.daysUntilDeadline;
    if (days === null) return '';
    if (days < 0)  return `Appeal deadline expired ${Math.abs(days)} days ago.`;
    if (days === 0) return 'Appeal deadline is today!';
    if (days === 1) return '1 day remaining to appeal.';
    return `${days} days remaining to appeal.`;
  }

  // ── Status / Decision helpers ───────────────────────────────────────────
  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      FILED:'badge-info', UNDER_REVIEW:'badge-warning',
      HEARING_SCHEDULED:'badge-orange', DECIDED:'badge-purple',
      CLOSED:'badge-muted', WITHDRAWN:'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }

  getStatusLabel(s: string): string { return s?.replace(/_/g, ' ') ?? s; }

  getDecisionClass(d: string): string {
    return ({ UPHELD:'badge-success', PARTIALLY_UPHELD:'badge-lime',
              DISMISSED:'badge-danger' }[d]) ?? 'badge-secondary';
  }

  getDecisionMessage(d: string): string {
    const m: Record<string, string> = {
      UPHELD:           'Your appeal was successful. The demand has been cancelled.',
      PARTIALLY_UPHELD: 'Your appeal was partially successful. Partial relief has been granted.',
      DISMISSED:        'Your appeal was dismissed. The original demand remains in effect.',
    };
    return m[d] ?? '';
  }

  // ── Pay Now ─────────────────────────────────────────────────────────────
  goToPay(): void {
    if (!this.appeal) return;
    let amount = this.appeal.demandedAmount;
    if (this.appeal.decision === 'PARTIALLY_UPHELD') {
      amount = this.appeal.acceptedAmount ?? this.appeal.demandedAmount;
    }
    this.router.navigate(['/my-portal/payments/create'], {
      queryParams: {
        source:      'DEMAND',
        demandNo:    (this.appeal as any).demandNo ?? null,
        amount:      amount,
        paymentType: 'Demand Notice',
        returnUrl:   '/my-portal/appeals/' + this.appeal.id,
      },
    });
  }
}