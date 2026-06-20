import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AitService } from '../../services/ait.service';
import {
  AitDetailResponse,
  AitSourceType,
  AitStatus,
  AIT_STATUS_LABELS,
  AIT_STATUS_CLASSES,
  AIT_SOURCE_LABELS,
  AitDocument,
} from '../../models/ait.model';
import { Role } from 'src/app/core/constants/roles.constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';

interface WorkflowStep {
  status: AitStatus | string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-officer-review',
  templateUrl: './officer-review.component.html',
  styleUrls: ['./officer-review.component.css'],
})
export class OfficerReviewComponent implements OnInit, OnDestroy {
  ait: AitDetailResponse | null = null;
  isLoading = false;
  isActioning = false;
  isOfficerRole = false;
  isTaxpayerRole = false;
  showRejectPanel = false;

  documents: AitDocument[] = [];
  isUploading = false;
  uploadError: string | null = null;

  challanForm!: FormGroup;
  reviewForm!: FormGroup;
  rejectForm!: FormGroup;

  workflowSteps: WorkflowStep[] = [
    { status: 'DRAFT', label: 'Draft', icon: 'bi-file-earmark' },
    { status: 'SUBMITTED', label: 'Submitted', icon: 'bi-send' },
    { status: 'PENDING', label: 'Pending', icon: 'bi-clock' },
    { status: 'UNDER_REVIEW', label: 'In Review', icon: 'bi-search' },
    { status: 'APPROVED', label: 'Approved', icon: 'bi-check-circle' },
    { status: 'CREDITED', label: 'Credited', icon: 'bi-cash-coin' },
  ];

  private statusOrder = [
    'DRAFT',
    'SUBMITTED',
    'PENDING',
    'UNDER_REVIEW',
    'APPROVED',
    'CREDITED',
  ];

  private destroy$ = new Subject<void>();

  // ✅ Role-aware back navigation
  get backRoute(): string {
    return this.isTaxpayerRole ? '/my-portal/ait' : '/ait/officer-dashboard';
  }

  get backLabel(): string {
    return this.isTaxpayerRole ? 'Back to My AIT Records' : 'Back to Queue';
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private aitService: AitService,
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

    this.buildForms();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRecord(id);
    // ✅ loadDocuments() ngOnInit থেকে সরানো হয়েছে
    //    loadRecord() এর next callback-এ call হবে
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForms(): void {
    this.challanForm = this.fb.group({
      challanNumber: ['', [Validators.required, Validators.maxLength(50)]],
      bankName: ['', [Validators.required, Validators.maxLength(100)]],
    });
    this.reviewForm = this.fb.group({
      approvedAmount: [null],
      approvalNotes: [''],
    });
    this.rejectForm = this.fb.group({
      rejectionReason: ['', [Validators.required, Validators.minLength(10)]],
      feedbackForTaxpayer: [''],
    });
  }

  // ── Data Loading ──────────────────────────────────────────────────────────

  loadRecord(id: number): void {
    this.isLoading = true;
    this.aitService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.ait = data;
          this.isLoading = false;

          this.reviewForm.patchValue({
            approvedAmount: data.calculatedAitAmount,
          });
          
          if (data.challanNumber || data.bankName) {
            this.challanForm.patchValue({
              challanNumber: data.challanNumber ?? '',
              bankName: data.bankName ?? '',
            });
          }

          this.loadDocuments(id);
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Failed to load AIT record.');
          this.isLoading = false;
          this.router.navigate(['..'], { relativeTo: this.route });
        },
      });
  }

  // ✅ id parameter নেয় — ait?.id ?? 0 race condition নেই
  loadDocuments(aitId: number): void {
    this.http
      .get<AitDocument[]>(API_ENDPOINTS.AITS.DOCUMENTS.LIST(aitId))
      .subscribe({
        next: (docs) => (this.documents = docs),
        error: () => (this.documents = []),
      });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  onSubmitRecord(): void {
    if (!this.ait) return;

    const payload = {
      attachmentIds: this.documents.map((d) => d.id),
      challanNumber: this.challanForm.value.challanNumber || undefined,
      bankName: this.challanForm.value.bankName || undefined,
    };

    this.isActioning = true;
    this.aitService
      .submit(this.ait.id!, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('AIT record submitted successfully.');
          this.loadRecord(this.ait!.id!);
          this.isActioning = false;
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Submission failed.');
          this.isActioning = false;
        },
      });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.ait?.id) return;

    if (file.size > 10 * 1024 * 1024) {
      this.uploadError = 'File must be less than 10MB.';
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      this.uploadError = 'Only PDF, JPG, PNG files are allowed.';
      return;
    }

    this.uploadError = null;
    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file);

    this.http
      .post<AitDocument>(
        API_ENDPOINTS.AITS.DOCUMENTS.UPLOAD(this.ait.id),
        formData,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (doc) => {
          this.documents.push(doc); // ✅ this.documents update হয়
          this.isUploading = false;
          this.uploadError = null;
          this.toast.success('Document uploaded successfully.');
          input.value = '';
        },
        error: (err) => {
          this.isUploading = false;
          this.uploadError = err.error?.message ?? 'Upload failed.';
        },
      });
  }

  deleteDoc(docId: number): void {
    if (!this.ait?.id) return;
    this.http
      .delete(API_ENDPOINTS.AITS.DOCUMENTS.DELETE(this.ait.id, docId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.documents = this.documents.filter((d) => d.id !== docId);
          this.toast.success('Document removed.');
        },
        error: (err) =>
          this.toast.error(err?.error?.message ?? 'Delete failed.'),
      });
  }

  downloadDoc(doc: AitDocument): void {
    if (!this.ait?.id) return;
    this.http
      .get(API_ENDPOINTS.AITS.DOCUMENTS.DOWNLOAD(this.ait.id, doc.id), {
        responseType: 'blob',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = doc.fileName;
          anchor.click();
          URL.revokeObjectURL(url);
        },
        error: () => this.toast.error('Download failed.'),
      });
  }

  onVerifyChallan(): void {
    if (!this.ait || this.challanForm.invalid) return;
    this.isActioning = true;
    this.aitService
      .verifyChallan(this.ait.id!, this.challanForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Challan verified. Record moved to review queue.');
          this.loadRecord(this.ait!.id!);
          this.isActioning = false;
        },
        error: (err) => {
          this.toast.error(
            err?.error?.message ?? 'Challan verification failed.',
          );
          this.isActioning = false;
        },
      });
  }

  onAssign(): void {
    if (!this.ait) return;
    this.isActioning = true;
    this.aitService
      .assignToMe(this.ait.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Record assigned to you. Status: Under Review.');
          this.loadRecord(this.ait!.id!);
          this.isActioning = false;
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Assignment failed.');
          this.isActioning = false;
        },
      });
  }

  onApprove(): void {
    if (!this.ait) return;
    this.isActioning = true;
    const payload = {
      approvedAmount: this.reviewForm.value.approvedAmount || undefined,
      approvalNotes: this.reviewForm.value.approvalNotes || undefined,
    };
    this.aitService
      .approve(this.ait.id!, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('AIT record approved successfully.');
          this.loadRecord(this.ait!.id!);
          this.isActioning = false;
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Approval failed.');
          this.isActioning = false;
        },
      });
  }

  onReject(): void {
    if (!this.ait || this.rejectForm.invalid) return;
    this.isActioning = true;
    this.aitService
      .reject(this.ait.id!, this.rejectForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('AIT record rejected. Taxpayer notified.');
          this.showRejectPanel = false;
          this.loadRecord(this.ait!.id!);
          this.isActioning = false;
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Rejection failed.');
          this.isActioning = false;
        },
      });
  }

  onCredit(): void {
    if (!this.ait) return;
    this.isActioning = true;
    this.aitService
      .credit(this.ait.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('AIT credit posted to taxpayer ITR ledger.');
          this.loadRecord(this.ait!.id!);
          this.isActioning = false;
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Credit posting failed.');
          this.isActioning = false;
        },
      });
  }

  onDownloadCertificate(): void {
    if (!this.ait) return;
    this.aitService
      .downloadCertificate(this.ait.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `AIT-Certificate-${this.ait!.aitReferenceNo}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          this.toast.success('Certificate downloaded.');
        },
        error: (err) =>
          this.toast.error(err?.error?.message ?? 'Download failed.'),
      });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  canAct(): boolean {
    return (
      !!this.ait &&
      ['SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(
        this.ait.status,
      )
    );
  }

  isStepDone(stepStatus: string): boolean {
    if (!this.ait || this.ait.status === 'REJECTED') return false;
    return (
      this.statusOrder.indexOf(stepStatus) <
      this.statusOrder.indexOf(this.ait.status)
    );
  }

  isStepActive(stepStatus: string): boolean {
    return this.ait?.status === stepStatus;
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024,
      sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatCurrency(value: number | undefined): string {
    if (value == null) return '৳0';
    return (
      '৳' +
      value.toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  getStatusLabel = (s: AitStatus) => AIT_STATUS_LABELS[s] ?? s;
  getStatusClass = (s: AitStatus) => AIT_STATUS_CLASSES[s] ?? '';
  getSourceLabel = (s: AitSourceType) => AIT_SOURCE_LABELS[s] ?? s;

  getSourceClass(s: AitSourceType): string {
    return (
      (
        {
          IMPORT: 'cat-import',
          SUPPLIER: 'cat-supplier',
          SALARY: 'cat-salary',
          CONTRACTOR: 'cat-contractor',
          RENT: 'cat-rent',
        } as any
      )[s] ?? ''
    );
  }
  getSourceIcon(s: AitSourceType): string {
    return (
      (
        {
          IMPORT: 'bi-box-seam',
          SUPPLIER: 'bi-truck',
          SALARY: 'bi-person-badge',
          CONTRACTOR: 'bi-tools',
          RENT: 'bi-building',
        } as any
      )[s] ?? 'bi-receipt'
    );
  }
}
