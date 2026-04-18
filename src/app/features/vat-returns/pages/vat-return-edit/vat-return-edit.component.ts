import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatReturn, VatReturnStatus } from '../../../../models/vat-return.model';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'app-vat-return-edit',
  templateUrl: './vat-return-edit.component.html',
  styleUrls:  ['./vat-return-edit.component.css']
})
export class VatReturnEditComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isLoading   = true;
  isSaving    = false;
  vatId       = 0;
  returnNo    = '';
  businessName = '';
  statuses: VatReturnStatus[] = ['Draft' , 'Submitted' , 'Under Review' ,
  'Accepted' , 'Rejected' , 'Overdue' ,
  'Amended' , 'Send Back'];

  private destroy$ = new Subject<void>();

  returnPeriods   = ['Monthly', 'Quarterly', 'Annually'];
  months          = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
  quarters        = ['Q1','Q2','Q3','Q4'];
  years           = ['2025','2024','2023','2022','2021'];
  assessmentYears = ['2025-26','2024-25','2023-24','2022-23'];
  submitters      = ['Taxpayer','Tax Officer','Data Entry Operator','Tax Commissioner'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.vatId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      returnPeriod:      ['Monthly', Validators.required],
      periodMonth:       ['', Validators.required],
      periodYear:        ['2025', Validators.required],
      assessmentYear:    ['2025-26'],
      submissionDate:    [''],
      dueDate:           [''],
      taxableSupplies:   [0, Validators.min(0)],
      exemptSupplies:    [0, Validators.min(0)],
      zeroRatedSupplies: [0, Validators.min(0)],
      outputTax:         [0, Validators.min(0)],
      inputTax:          [0, Validators.min(0)],
      taxPaid:           [0, Validators.min(0)],
      submittedBy:       [''],
      statuses:     ['Draft'],
      remarks:           ['']
    });
  }

  ctrl(name: string) { return this.form.get(name); }

  get periodOptions(): string[] {
    return this.ctrl('returnPeriod')?.value === 'Quarterly' ? this.quarters : this.months;
  }

  get totalSupplies(): number {
    const v = this.form.value;
    return (v.taxableSupplies || 0) + (v.exemptSupplies || 0) + (v.zeroRatedSupplies || 0);
  }

  get netTaxPayable(): number {
    const v = this.form.value;
    return Math.max(0, (v.outputTax || 0) - (v.inputTax || 0));
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  private loadData(): void {
    this.isLoading = true;
    this.http.get<VatReturn>(API_ENDPOINTS.VAT_RETURNS.GET(this.vatId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.returnNo    = data.returnNo;
          this.businessName = data.businessName;
          this.form.patchValue({
            returnPeriod:      data.returnPeriod,
            periodMonth:       data.periodMonth,
            periodYear:        data.periodYear,
            assessmentYear:    data.assessmentYear,
            submissionDate:    data.submissionDate,
            dueDate:           data.dueDate,
            taxableSupplies:   data.taxableSupplies,
            exemptSupplies:    data.exemptSupplies,
            zeroRatedSupplies: data.zeroRatedSupplies,
            outputTax:         data.outputTax,
            inputTax:          data.inputTax,
            taxPaid:           data.taxPaid,
            submittedBy:       data.submittedBy,
            remarks:           data.remarks
          });
        },
        error: () => {
          this.toast.error('Failed to load VAT return data.');
          this.router.navigate(['/vat-returns']);
        }
      });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;
    const payload = {
      ...this.form.value,
      totalSupplies: this.totalSupplies,
      netTaxPayable: this.netTaxPayable
    };

    this.http.put(API_ENDPOINTS.VAT_RETURNS.UPDATE(this.vatId), payload)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toast.success('VAT Return updated successfully!');
          setTimeout(() => this.router.navigate(['/vat-returns/view', this.vatId]), 1500);
        },
        error: (err) => {
          if (err?.status === 409) {
            this.toast.error(err.error?.message || 'Conflict: duplicate period detected.');
          } else if (err?.status === 400) {
            this.toast.error(err.error?.message || 'Invalid data. Please check all fields.');
          } else {
            this.toast.error('Failed to update VAT return. Please try again.');
          }
        }
      });
  }

  onCancel(): void { this.router.navigate(['/vat-returns/view', this.vatId]); }
  
}
