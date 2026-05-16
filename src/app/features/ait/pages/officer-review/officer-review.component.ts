import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AitService } from '../../services/ait.service';
import { AitDetailResponse, AitDocument, DocumentRequest } from '../../models/ait.model';

@Component({
  selector: 'app-officer-review',
  templateUrl: './officer-review.component.html',
  styleUrls: ['./officer-review.component.css']
})
export class OfficerReviewComponent implements OnInit {
  ait: AitDetailResponse | null = null;
  documents: AitDocument[] = [];
  pendingRequests: DocumentRequest[] = [];

  activeDocTabId: number | null = null;
  selectedDocument: AitDocument | null = null;

  // Actions state
  actionInProgress: string | null = null;
  actionError: string | null = null;
  actionSuccess: string | null = null;

  // Modals
  showApproveModal: boolean = false;
  showRejectModal: boolean = false;
  showRequestModal: boolean = false;

  // Form data
  approveForm = {
    approvedAmount: 0,
    approvalNotes: ''
  };

  rejectForm = {
    rejectionReason: ''
  };

  requestForm = {
    requestType: 'INFO',
    requestedDocuments: '',
    requestReason: '',
    deadline: ''
  };

  isLoading: boolean = true;
  loadError: string | null = null;

  aitId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aitService: AitService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.aitId = params['id'];
      if (this.aitId) {
        this.loadAitDetails();
      }
    });
  }

  loadAitDetails(): void {
    if (!this.aitId) return;

    this.isLoading = true;
    this.loadError = null;

    this.aitService.getById(this.aitId).subscribe({
      next: (detail) => {
        this.ait = detail;
        this.documents = detail.documents || [];
        this.pendingRequests = detail.pendingRequests || [];
        this.approveForm.approvedAmount = detail.approvedAitAmount || detail.calculatedAitAmount;
        if (this.documents.length > 0) {
          this.selectDocument(this.documents[0]);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load AIT details:', err);
        this.loadError = 'Failed to load AIT record. Please try again.';
        this.isLoading = false;
      }
    });
  }

  selectDocument(doc: AitDocument): void {
    this.selectedDocument = doc;
    this.activeDocTabId = doc.id;
  }

  // Approve Action
  openApproveModal(): void {
    this.showApproveModal = true;
    this.approveForm.approvedAmount = this.ait?.approvedAitAmount || this.ait?.calculatedAitAmount || 0;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.actionError = null;
  }

  submitApprove(): void {
    if (!this.ait?.id) return;

    this.actionInProgress = 'approve';
    this.actionError = null;

    this.aitService.approve(this.ait.id, this.approveForm.approvedAmount, this.approveForm.approvalNotes).subscribe({
      next: (result) => {
        this.actionSuccess = 'AIT record approved successfully!';
        this.actionInProgress = null;
        this.showApproveModal = false;
        setTimeout(() => {
          this.router.navigate(['/aits/officer-dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.actionError = err?.message || 'Failed to approve AIT. Please try again.';
        this.actionInProgress = null;
      }
    });
  }

  // Reject Action
  openRejectModal(): void {
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.actionError = null;
  }

  submitReject(): void {
    if (!this.ait?.id || !this.rejectForm.rejectionReason.trim()) {
      this.actionError = 'Please provide a rejection reason.';
      return;
    }

    this.actionInProgress = 'reject';
    this.actionError = null;

    this.aitService.reject(this.ait.id, this.rejectForm.rejectionReason).subscribe({
      next: (result) => {
        this.actionSuccess = 'AIT record rejected successfully!';
        this.actionInProgress = null;
        this.showRejectModal = false;
        setTimeout(() => {
          this.router.navigate(['/aits/officer-dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.actionError = err?.message || 'Failed to reject AIT. Please try again.';
        this.actionInProgress = null;
      }
    });
  }

  // Request Correction Action
  openRequestModal(): void {
    this.showRequestModal = true;
  }

  closeRequestModal(): void {
    this.showRequestModal = false;
    this.actionError = null;
  }

  submitRequest(): void {
    if (!this.ait?.id || !this.requestForm.requestedDocuments.trim()) {
      this.actionError = 'Please specify which documents are required.';
      return;
    }

    this.actionInProgress = 'request';
    this.actionError = null;

    const request: Partial<DocumentRequest> = {
      requestType: this.requestForm.requestType as any,
      requestedDocuments: this.requestForm.requestedDocuments,
      requestReason: this.requestForm.requestReason,
      deadline: this.requestForm.deadline
    };

    this.aitService.createDocumentRequest(this.ait.id, request as any).subscribe({
      next: (result) => {
        this.actionSuccess = 'Document request sent successfully!';
        this.actionInProgress = null;
        this.showRequestModal = false;
        this.pendingRequests.push(result);
        setTimeout(() => {
          this.loadAitDetails();
        }, 1500);
      },
      error: (err) => {
        this.actionError = err?.message || 'Failed to send document request. Please try again.';
        this.actionInProgress = null;
      }
    });
  }

  // Helpers
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'DRAFT': 'status-draft',
      'SUBMITTED': 'status-submitted',
      'PENDING': 'status-pending',
      'PAID': 'status-paid',
      'UNDER_REVIEW': 'status-review',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected',
      'CREDITED': 'status-credited',
      'CANCELLED': 'status-cancelled',
    };
    return colors[status] || 'status-default';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Draft',
      'SUBMITTED': 'Submitted',
      'PENDING': 'Pending',
      'PAID': 'Paid',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'CREDITED': 'Credited',
      'CANCELLED': 'Cancelled',
    };
    return labels[status] || 'Unknown';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  goBack(): void {
    this.router.navigate(['/aits/officer-dashboard']);
  }

  canApprove(): boolean {
    return this.ait?.status === 'PAID' || this.ait?.status === 'UNDER_REVIEW';
  }

  canReject(): boolean {
    return this.ait?.status === 'PAID' || this.ait?.status === 'UNDER_REVIEW';
  }

  canRequestCorrection(): boolean {
    return this.ait?.status === 'UNDER_REVIEW' || this.ait?.status === 'CORRECTION_REQUESTED';
  }
}
