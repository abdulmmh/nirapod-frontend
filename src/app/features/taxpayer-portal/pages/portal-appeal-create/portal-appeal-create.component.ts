import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppealService } from '../../../appeal-management/service/appeal.service';

@Component({
  selector: 'app-portal-appeal-create',
  templateUrl: './portal-appeal-create.component.html',
  styleUrls: ['./portal-appeal-create.component.css']
})
export class PortalAppealCreateComponent implements OnInit {

  form!:         FormGroup;
  isSubmitting   = false;
  submitError:   string | null = null;

  auditCaseId:    number | null = null;
  assessmentNo:   string | null = null;
  caseNo:         string | null = null;
  demandNoticeId: number | null = null;
  demandedAmount: number | null = null;

  constructor(
    private fb:            FormBuilder,
    private route:         ActivatedRoute,
    private router:        Router,
    private appealService: AppealService,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.auditCaseId    = params['auditCaseId']    ? +params['auditCaseId']    : null;
    this.demandNoticeId = params['demandNoticeId'] ? +params['demandNoticeId'] : null;
    this.assessmentNo   = params['assessmentNo']   ?? null;
    this.caseNo         = params['caseNo']         ?? null;
    this.demandedAmount = params['demandedAmount'] ? +params['demandedAmount'] : null;
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      auditCaseId:        [this.auditCaseId, Validators.required],
      demandNoticeId:     [this.demandNoticeId],
      appealType:         ['DEMAND_NOTICE', Validators.required],
      groundsText:        ['', [Validators.required, Validators.minLength(50)]],
      reliefSought:       [''],
      supportingEvidence: [''],
      disputedAmount:     [this.demandedAmount ?? null],
      remarks:            [''],
    });
  }

  get f() { return this.form.controls; }

  onCancel(): void {
    if (this.auditCaseId) {
      this.router.navigate(['/my-portal/audits', this.auditCaseId]);
    } else {
      this.router.navigate(['/my-portal/appeals']);
    }
  }

  onSubmit(): void {
    this.submitError = null;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting = true;

    this.appealService.fileAppeal(this.form.value).subscribe({
      next: created => {
        this.isSubmitting = false;
        this.router.navigate(['/my-portal/appeals', created.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message
          || 'Failed to file appeal. Please try again.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}