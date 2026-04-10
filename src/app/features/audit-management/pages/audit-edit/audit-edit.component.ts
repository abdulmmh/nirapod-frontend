import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Audit } from '../../../../models/audit.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-audit-edit',
  templateUrl: './audit-edit.component.html',
  styleUrls: ['./audit-edit.component.css'],
})
export class AuditEditComponent implements OnInit {
  // ──────── Properties ────────────
  isLoading = true;
  isSaving = false;
  auditId: number | null = null;

  form: Partial<Audit> = {};
  private destroy$ = new Subject<void>();

  // ────────── Static Data ──────────────

  auditTypes = [
    'VAT Audit',
    'Income Tax Audit',
    'Full Audit',
    'Desk Audit',
    'Field Audit',
    'Special Audit',
  ];
  priorities = ['Low', 'Medium', 'High', 'Critical'];
  statuses = [
    'Scheduled',
    'In Progress',
    'Completed',
    'Flagged',
    'Cancelled',
    'Pending',
  ];
  assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];
  auditors = [
    'Auditor Rahim',
    'Auditor Kamal',
    'Auditor Nasrin',
    'Auditor Faruk',
    'Auditor Imran',
    'Auditor Reza',
    'Senior Auditor Hasan',
    'Senior Auditor Mila',
  ];
  supervisors = [
    'Tax Commissioner',
    'Deputy Commissioner',
    'Assistant Commissioner',
    'Senior Tax Officer',
  ];

  // ─────────── Constructor ──────────────

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  // ───────────── Lifecycle ──────────────────

  ngOnInit(): void {
    this.initializeAudit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────── Initialization  ─────────────

  private initializeAudit(): void {
    const id = this.getValidAuditId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.auditId = id;
    this.fetchAudit();
  }

  // ───────────  Data Fetching ───────────────

  private fetchAudit(): void {
    if (!this.auditId) return;

    this.isLoading = true;

    this.http
      .get<Audit>(API_ENDPOINTS.AUDITS.GET(this.auditId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Audit): void {
    this.form = { ...data };
  }

  private handleFetchError(error: any): void {
    this.isLoading = false;
    this.toast.error('Failed to fetch audit details. Please try again.');
  }

  // ────────── Validation ───────────────

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber &&
      this.form.taxpayerName &&
      this.form.auditType &&
      this.form.priority &&
      this.form.scheduledDate &&
      this.form.assignedTo
    );
  }

  private getValidAuditId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid business ID. Please go back and try again.');
  }

  // ───────── Actions  ─────────────

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    }

    if (!this.auditId) {
      this.handleInvalidId();
      return;
    }

    this.isSaving = true;
    this.updateAudit();
  }

  private updateAudit(): void {
    this.http
      .put(API_ENDPOINTS.AUDITS.UPDATE(this.auditId!), this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => this.handleUpdateSuccess(),
        error: (error) => this.handleUpdateError(error),
      });
  }

  private handleUpdateSuccess(): void {
    this.toast.success('Audit updated successfully!');
    this.router.navigate(['/audits', this.auditId]);
  }

  private handleUpdateError(error: any): void {
    this.toast.error('Failed to update audit. Please try again.');
  }

  private showValidationWarning(): void {
    this.toast.warning('Please fill in all required fields.');
  }

  // ─────────── Events  ────────────────
  onCancel(): void {
    this.router.navigate(['/audits', this.auditId]);
  }
}
