// ─── assessment-review.component.ts ─────────────────────────────────────────
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from '../../service/audit.service';
import { AuditCase } from '../../../../models/audit.model';

@Component({
  selector: 'app-assessment-review',
  templateUrl: './assessment-review.component.html',
  styleUrls: ['./assessment-review.component.css']
})
export class AssessmentReviewComponent implements OnInit {

  auditCase: AuditCase | null = null;
  caseId  = 0;
  caseNo  = '';
  isSubmitting = false;

  assessForm!: FormGroup;

  live = {
    declaredIncome: 0, assessedIncome: 0,
    additionalTax: 0, penaltyAmount: 0,
    interestAmount: 0, totalDemand: 0,
  };

  constructor(
    private fb:     FormBuilder,
    private route:  ActivatedRoute,
    private router: Router,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.caseId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadCase();
  }

  buildForm(): void {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);

    this.assessForm = this.fb.group({
      declaredIncome:  [0],
      assessedIncome:  [0],
      declaredTax:     [0],
      assessedTax:     [0],
      additionalTax:   [0],
      penaltyRate:     [10],
      penaltyAmount:   [0],
      interestRate:    [2],
      interestMonths:  [0],
      interestAmount:  [0],
      findingsSummary: [''],
      legalBasis:      [''],
      appealRights:    ['Taxpayer may file an appeal within 45 days of this order.'],
      paymentDeadline: [deadline.toISOString().split('T')[0]],
    });
  }

  loadCase(): void {
    this.auditService.getCaseById(this.caseId).subscribe({
      next: c => {
        this.auditCase = c;
        this.caseNo    = c.caseNo;
      }
    });
  }

  recalculate(): void {
    const v = this.assessForm.value;
    this.live.declaredIncome  = +v.declaredIncome  || 0;
    this.live.assessedIncome  = +v.assessedIncome  || 0;
    this.live.additionalTax   = +v.additionalTax   || 0;
    this.live.penaltyAmount   = +v.penaltyAmount   || 0;
    this.live.interestAmount  = +v.interestAmount  || 0;
    this.live.totalDemand     = this.live.additionalTax
                               + this.live.penaltyAmount
                               + this.live.interestAmount;

    // Auto-calc additional tax from assessed vs declared tax
    const addlTax = Math.max(0, (+v.assessedTax || 0) - (+v.declaredTax || 0));
    if (addlTax > 0 && !v.additionalTax) {
      this.assessForm.patchValue({ additionalTax: addlTax }, { emitEvent: false });
      this.live.additionalTax = addlTax;
      this.live.totalDemand   = addlTax + this.live.penaltyAmount + this.live.interestAmount;
    }
  }

  calcPenalty(): void {
    const rate    = +this.assessForm.get('penaltyRate')?.value  || 0;
    const addlTax = +this.assessForm.get('additionalTax')?.value || 0;
    const penalty = +(addlTax * rate / 100).toFixed(2);
    this.assessForm.patchValue({ penaltyAmount: penalty }, { emitEvent: false });
    this.live.penaltyAmount = penalty;
    this.recalculate();
  }

  calcInterest(): void {
    const rate    = +this.assessForm.get('interestRate')?.value    || 0;
    const months  = +this.assessForm.get('interestMonths')?.value  || 0;
    const addlTax = +this.assessForm.get('additionalTax')?.value   || 0;
    const interest = +(addlTax * (rate / 100) * months).toFixed(2);
    this.assessForm.patchValue({ interestAmount: interest }, { emitEvent: false });
    this.live.interestAmount = interest;
    this.recalculate();
  }

  getBarWidth(declared: number, assessed: number): number {
    if (!assessed || assessed === 0) return 0;
    return Math.min(100, (declared / assessed) * 100);
  }

  onSubmit(): void {
    if (!this.caseId) return;
    this.isSubmitting = true;
    const v = this.assessForm.value;
    this.auditService.proposeAssessment(this.caseId, {
      declaredIncome:  +v.declaredIncome,
      assessedIncome:  +v.assessedIncome,
      declaredTax:     +v.declaredTax,
      assessedTax:     +v.assessedTax,
      additionalTax:   +v.additionalTax,
      penaltyRate:     +v.penaltyRate,
      penaltyAmount:   +v.penaltyAmount,
      interestRate:    +v.interestRate,
      interestMonths:  +v.interestMonths,
      interestAmount:  +v.interestAmount,
      findingsSummary: v.findingsSummary,
      legalBasis:      v.legalBasis,
      appealRights:    v.appealRights,
      paymentDeadline: v.paymentDeadline,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/audits', this.caseId]);
      },
      error: () => { this.isSubmitting = false; }
    });
  }
}

