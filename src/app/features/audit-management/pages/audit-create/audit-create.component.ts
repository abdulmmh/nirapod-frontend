import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { AuditCreateRequest } from '../../../../models/audit.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-audit-create',
  templateUrl: './audit-create.component.html',
  styleUrls: ['./audit-create.component.css'],
})
export class AuditCreateComponent implements OnDestroy {

  // ──────────────── State ────────────────
  isLoading = false;

  form: AuditCreateRequest = this.createEmptyForm();

  private destroy$ = new Subject<void>();

  // ──────────────── Static Data ────────────────
  readonly auditTypes = [
    'VAT Audit',
    'Income Tax Audit',
    'Full Audit',
    'Desk Audit',
    'Field Audit',
    'Special Audit',
  ];

  readonly priorities = ['Low', 'Medium', 'High', 'Critical'];

  readonly assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];

  readonly auditors = [
    'Auditor Rahim',
    'Auditor Kamal',
    'Auditor Nasrin',
    'Auditor Faruk',
    'Auditor Imran',
    'Auditor Reza',
    'Senior Auditor Hasan',
    'Senior Auditor Mila',
  ];

  readonly supervisors = [
    'Tax Commissioner',
    'Deputy Commissioner',
    'Assistant Commissioner',
    'Senior Tax Officer',
  ];

  // ────────────── Constructor  ────────────────

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  // ──────────────── Lifecycle ────────────────

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────── Form Factory  ────────────────
  private createEmptyForm(): AuditCreateRequest {
    return {
      tinNumber: '',
      taxpayerName: '',
      auditType: '',
      priority: 'Medium',
      assessmentYear: '2024-25',
      returnNo: '',
      scheduledDate: this.getTodayDate(),
      assignedTo: '',
      supervisedBy: '',
      remarks: '',
    };
  }

  // ──────────────── Getters ──────────────── 

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ──────────────── Validation  ────────────────
  isFormValid(): boolean {
    return this.hasRequiredFields();
  }

  private hasRequiredFields(): boolean {
    return !!(
      this.form.tinNumber &&
      this.form.taxpayerName &&
      this.form.auditType &&
      this.form.priority &&
      this.form.scheduledDate &&
      this.form.assignedTo &&
      this.form.supervisedBy
    );
  }

  // ──────────── Actions ───────────────────
  
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationWarning();
      return;
    }

    this.isLoading = true;
    this.createAudit();
  }

  private createAudit(): void {
    this.http
      .post(API_ENDPOINTS.AUDITS.CREATE, this.form)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error),
      });
  }

  private handleSuccess(): void {
    this.toast.success('Audit created successfully!');
    setTimeout(() => this.router.navigate(['/audits']), 1500);
  }

  private handleError(error: unknown): void {
    console.error('Error creating audit:', error);
    this.toast.error('Failed to create audit. Please try again.');
  }

  onReset(): void {
    this.form = this.createEmptyForm();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/audits']);
  }

  private showValidationWarning(): void {
    this.toast.warning('Please fill in all required fields with valid values.');
  }
}