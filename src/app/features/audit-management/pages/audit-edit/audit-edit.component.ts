import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import {
  AuditCase,
  AuditCaseCreateRequest,
} from '../../../../models/audit.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { FiscalYear } from '../../../../models/fiscal-year.model';

@Component({
  selector: 'app-audit-edit',
  templateUrl: './audit-edit.component.html',
  styleUrls: ['./audit-edit.component.css'],
})
export class AuditEditComponent implements OnInit, OnDestroy {
  isLoading = true;
  isSaving = false;
  auditId: number | null = null;

  form: Partial<AuditCase> = {};
  private destroy$ = new Subject<void>();

  readonly auditTypes = [
    { value: 'DESK', label: 'Desk Audit' },
    { value: 'FIELD', label: 'Field Audit' },
    { value: 'COMPREHENSIVE', label: 'Comprehensive Audit' },
    { value: 'VAT', label: 'VAT Audit' },
    { value: 'REFUND', label: 'Refund Audit' },
    { value: 'SPECIAL', label: 'Special Investigation' },
  ];

  readonly taxTypes = [
    { value: 'INCOME_TAX', label: 'Income Tax' },
    { value: 'VAT', label: 'VAT' },
    { value: 'AIT', label: 'AIT' },
  ];

  readonly triggerReasons = [
    { value: 'RISK_BASED', label: 'Risk-Based Selection' },
    { value: 'RANDOM', label: 'Random Selection' },
    { value: 'REFUND_CLAIM', label: 'Large Refund Claim' },
    { value: 'MISMATCH', label: 'Significant Mismatch' },
    { value: 'LATE_FILING', label: 'Late Filing' },
    { value: 'COMPLAINT', label: 'Anonymous Complaint' },
    { value: 'DIRECTIVE', label: 'Supervisor Directive' },
    { value: 'CAMPAIGN', label: 'Industry Campaign' },
  ];

  readonly priorities = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
  fiscalYears: FiscalYear[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initializeAudit();
    this.loadFiscalYears();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeAudit(): void {
    const id = this.getValidAuditId();
    if (!id) {
      this.handleInvalidId();
      return;
    }
    this.auditId = id;
    this.fetchAudit();
  }

  private loadFiscalYears(): void {
  this.http
    .get<FiscalYear[]>(API_ENDPOINTS.FISCAL_YEARS.LIST)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (years) => {
        this.fiscalYears = years.sort((a, b) =>
          b.yearName.localeCompare(a.yearName),
        );
      },
      error: () => {
        this.fiscalYears = [];
        this.toast.warning('Could not load fiscal year list.');
      },
    });
}

  private fetchAudit(): void {
    if (!this.auditId) return;
    this.isLoading = true;

    this.http
      .get<AuditCase>(API_ENDPOINTS.AUDITS.GET(this.auditId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: () => this.handleFetchError(),
      });
  }

  private handleFetchSuccess(data: AuditCase): void {
    if (data.status !== 'CASE_CREATED') {
      this.toast.warning(
        `This case is "${data.status.replace(/_/g, ' ')}" — only newly created cases can be edited. Use the workflow action buttons instead.`,
      );
      this.router.navigate(['/audits', this.auditId]);
      return;
    }
    this.form = { ...data };
  }

  private handleFetchError(): void {
    this.toast.error('Failed to fetch audit details. Please try again.');
    this.router.navigate(['/audits']);
  }

  isFormValid(): boolean {
    return !!(
      this.form.auditType &&
      this.form.taxType &&
      this.form.triggerReason
    );
  }

  private getValidAuditId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);
    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid audit case ID. Please go back and try again.');
    this.router.navigate(['/audits']);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields.');
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
    const payload: AuditCaseCreateRequest = {
      taxpayerId: this.form.taxpayerId!,
      auditType: this.form.auditType!,
      taxType: this.form.taxType!,
      triggerReason: this.form.triggerReason!,
      fiscalYear: this.form.fiscalYear || undefined,
      taxPeriodStart: this.form.taxPeriodStart || undefined,
      taxPeriodEnd: this.form.taxPeriodEnd || undefined,
      riskScore: this.form.riskScore ?? 0,
      priority: this.form.priority || 'NORMAL',
      returnReference: this.form.returnReference || undefined,
      assignedOfficerName: this.form.assignedOfficerName || undefined,
      supervisorName: this.form.supervisorName || undefined,
      scheduledDate: this.form.scheduledDate || undefined,
      dueDate: this.form.dueDate || undefined,
      remarks: this.form.remarks || undefined,
    };

    this.http
      .put(API_ENDPOINTS.AUDITS.UPDATE(this.auditId!), payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: () => this.handleUpdateSuccess(),
        error: (err) => this.handleUpdateError(err),
      });
  }

  private handleUpdateSuccess(): void {
    this.toast.success('Audit case updated successfully!');
    this.router.navigate(['/audits', this.auditId]);
  }

  private handleUpdateError(err: any): void {
    const msg =
      err?.error?.message || 'Failed to update audit. Please try again.';
    this.toast.error(msg);
  }

  onCancel(): void {
    this.router.navigate(['/audits', this.auditId]);
  }
}
