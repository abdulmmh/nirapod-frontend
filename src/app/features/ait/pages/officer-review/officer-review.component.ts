import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
} from '../../models/ait.model';
import { Role } from 'src/app/core/constants/roles.constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/toast/toast.service';

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

  // Reactive forms (replacing old component-state approach)
  challanForm!: FormGroup;
  reviewForm!: FormGroup;
  rejectForm!: FormGroup;

  // Workflow progress steps
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

  constructor(
    private fb: FormBuilder,
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
    this.isTaxpayerRole = this.auth.hasRole(Role.TAXPAYER);

    this.buildForms();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRecord(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form construction ──────────────────────────────────────────────────────

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

  // ── Data ───────────────────────────────────────────────────────────────────

  loadRecord(id: number): void {
    this.isLoading = true;
    this.aitService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.ait = data;
          this.isLoading = false;
          // Pre-fill approved amount with calculated amount
          this.reviewForm.patchValue({
            approvedAmount: data.calculatedAitAmount,
          });
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Failed to load AIT record.');
          this.isLoading = false;
          this.router.navigate(['..'], { relativeTo: this.route });
        },
      });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

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

  onSubmitRecord(): void {
    if (!this.ait) return;
    this.isActioning = true;

    const payload = { attachmentIds: this.ait.documents.map((d) => d.id) };

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
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `AIT-Certificate-${this.ait!.aitReferenceNo}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.toast.success('Certificate downloaded.');
        },
        error: (err) => {
          this.toast.error(
            err?.error?.message ?? 'Certificate download failed.',
          );
        },
      });
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  canAct(): boolean {
    if (!this.ait) return false;
    return ['SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(
      this.ait.status,
    );
  }

  isStepDone(stepStatus: string): boolean {
    if (!this.ait) return false;
    if (this.ait.status === 'REJECTED') return false;
    const current = this.statusOrder.indexOf(this.ait.status);
    const step = this.statusOrder.indexOf(stepStatus);
    return step < current;
  }

  isStepActive(stepStatus: string): boolean {
    return this.ait?.status === stepStatus;
  }

  getStatusLabel(status: AitStatus): string {
    return AIT_STATUS_LABELS[status] ?? status;
  }

  getStatusClass(status: AitStatus): string {
    return AIT_STATUS_CLASSES[status] ?? '';
  }

  getSourceLabel(source: AitSourceType): string {
    return AIT_SOURCE_LABELS[source] ?? source;
  }

  getSourceClass(source: AitSourceType): string {
    const map: Record<AitSourceType, string> = {
      IMPORT: 'cat-import',
      SUPPLIER: 'cat-supplier',
      SALARY: 'cat-salary',
      CONTRACTOR: 'cat-contractor',
      RENT: 'cat-rent',
    };
    return map[source] ?? '';
  }

  getSourceIcon(source: AitSourceType): string {
    const map: Record<AitSourceType, string> = {
      IMPORT: 'bi-box-seam',
      SUPPLIER: 'bi-truck',
      SALARY: 'bi-person-badge',
      CONTRACTOR: 'bi-tools',
      RENT: 'bi-building',
    };
    return map[source] ?? 'bi-receipt';
  }

  getDocDownloadUrl(docId: number): string {
    return `http://localhost:8080/api/ait-records/${this.ait?.id}/documents/${docId}/download`;
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
}
