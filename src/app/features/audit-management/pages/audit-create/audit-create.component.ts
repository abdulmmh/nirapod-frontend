// ─── audit-create.component.ts ──────────────────────────────────────────────
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from '../../service/audit.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

interface TaxpayerSearchResult { id: number; name: string; tinNumber: string; }

@Component({
  selector: 'app-audit-create',
  templateUrl: './audit-create.component.html',
  styleUrls: ['./audit-create.component.css']
})
export class AuditCreateComponent implements OnInit {

  auditForm!:  FormGroup;
  isEditMode   = false;
  isSubmitting = false;
  caseId: number | null = null;

  taxpayerResults: TaxpayerSearchResult[] = [];
  private tpSearch$ = new Subject<string>();

  readonly fiscalYears = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];

  constructor(
    private fb:     FormBuilder,
    private router: Router,
    private route:  ActivatedRoute,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.isEditMode = true; this.caseId = +id; this.loadCase(+id); }

    this.tpSearch$.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(q => this.fetchTaxpayers(q));
  }

  buildForm(): void {
    this.auditForm = this.fb.group({
      taxpayerId:          [null, Validators.required],
      taxpayerName:        ['', Validators.required],
      tinDisplay:          [{ value: '', disabled: true }],
      auditType:           ['', Validators.required],
      taxType:             ['', Validators.required],
      triggerReason:       ['', Validators.required],
      fiscalYear:          [''],
      taxPeriodStart:      [''],
      taxPeriodEnd:        [''],
      riskScore:           [0],
      priority:            ['NORMAL'],
      returnReference:     [''],
      assignedOfficerId:   [null],
      assignedOfficerName: [''],
      supervisorId:        [null],
      supervisorName:      [''],
      scheduledDate:       [''],
      dueDate:             [''],
      remarks:             [''],
    });
  }

  get f() { return this.auditForm.controls; }

  loadCase(id: number): void {
    this.auditService.getCaseById(id).subscribe({
      next: c => {
        this.auditForm.patchValue({
          taxpayerId:          c.taxpayerId,
          taxpayerName:        c.taxpayerName,
          tinDisplay:          c.tinNumber,
          auditType:           c.auditType,
          taxType:             c.taxType,
          triggerReason:       c.triggerReason,
          fiscalYear:          c.fiscalYear,
          taxPeriodStart:      c.taxPeriodStart,
          taxPeriodEnd:        c.taxPeriodEnd,
          riskScore:           c.riskScore,
          priority:            c.priority,
          returnReference:     c.returnReference,
          assignedOfficerName: c.assignedOfficerName,
          supervisorName:      c.supervisorName,
          scheduledDate:       c.scheduledDate,
          dueDate:             c.dueDate,
          remarks:             c.remarks,
        });
      }
    });
  }

  searchTaxpayer(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.tpSearch$.next(q);
  }

  openTaxpayerSearch(): void {
    // Trigger a blank search to show recent taxpayers
    this.fetchTaxpayers('');
  }

  fetchTaxpayers(q: string): void {
    // In real implementation: call TaxpayerService.search(q)
    // Mocked here for compilation — replace with actual HTTP call
    if (q.length < 1) { this.taxpayerResults = []; return; }
  }

  selectTaxpayer(tp: TaxpayerSearchResult): void {
    this.auditForm.patchValue({
      taxpayerId:   tp.id,
      taxpayerName: tp.name,
      tinDisplay:   tp.tinNumber,
    });
    this.taxpayerResults = [];
  }

  getRiskClass(score: number): string {
    if (score >= 75) return 'risk-critical';
    if (score >= 50) return 'risk-high';
    if (score >= 25) return 'risk-medium';
    return 'risk-low';
  }

  onSubmit(): void {
    if (this.auditForm.invalid) {
      this.auditForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const raw = this.auditForm.getRawValue();

    const payload = {
      taxpayerId:          raw.taxpayerId,
      auditType:           raw.auditType,
      taxType:             raw.taxType,
      triggerReason:       raw.triggerReason,
      fiscalYear:          raw.fiscalYear || undefined,
      taxPeriodStart:      raw.taxPeriodStart || undefined,
      taxPeriodEnd:        raw.taxPeriodEnd   || undefined,
      riskScore:           raw.riskScore,
      priority:            raw.priority,
      returnReference:     raw.returnReference || undefined,
      assignedOfficerName: raw.assignedOfficerName || undefined,
      supervisorName:      raw.supervisorName   || undefined,
      scheduledDate:       raw.scheduledDate    || undefined,
      dueDate:             raw.dueDate          || undefined,
      remarks:             raw.remarks          || undefined,
    };

    const call = this.auditService.createCase(payload);
    call.subscribe({
      next: created => {
        this.isSubmitting = false;
        this.router.navigate(['/audits', created.id]);
      },
      error: () => { this.isSubmitting = false; }
    });
  }
}
