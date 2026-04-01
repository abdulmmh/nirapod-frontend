import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VatReturn } from '../../../../models/vat-return.model';

@Component({
  selector: 'app-vat-return-edit',
  templateUrl: './vat-return-edit.component.html',
  styleUrls: ['./vat-return-edit.component.css']
})
export class VatReturnEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  vatId      = 0;

  returnPeriods   = ['Monthly', 'Quarterly', 'Annually'];
  months          = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  quarters        = ['Q1', 'Q2', 'Q3', 'Q4'];
  years           = ['2024', '2023', '2022', '2021'];
  assessmentYears = ['2024-25', '2023-24', '2022-23'];
  statuses        = ['Draft', 'Submitted', 'Accepted', 'Rejected', 'Overdue', 'Amended'];
  submitters      = ['Taxpayer', 'Tax Officer', 'Data Entry Operator', 'Tax Commissioner'];

  form: any = {};

  get periodOptions(): string[] {
    return this.form.returnPeriod === 'Quarterly' ? this.quarters : this.months;
  }

  get netTaxPayable(): number {
    return Math.max(0, (this.form.outputTax || 0) - (this.form.inputTax || 0));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vatId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.vatId,
      returnNo: 'VRT-2024-00001',
      binNo: 'BIN-2024-001001', tinNumber: 'TIN-1001',
      businessName: 'Rahman Textile Ltd.',
      returnPeriod: 'Monthly', periodMonth: 'January', periodYear: '2024',
      taxableSupplies: 500000, exemptSupplies: 0, zeroRatedSupplies: 0,
      totalSupplies: 500000, outputTax: 75000, inputTax: 30000,
      netTaxPayable: 45000, taxPaid: 45000,
      submissionDate: '2024-02-12', dueDate: '2024-02-15',
      assessmentYear: '2024-25', status: 'Accepted',
      submittedBy: 'Taxpayer', remarks: ''
    };
    this.isLoading = false;
  }

  isFormValid(): boolean {
    return !!(this.form.binNo && this.form.tinNumber &&
              this.form.businessName && this.form.returnPeriod &&
              this.form.periodMonth);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'VAT Return updated successfully!';
      setTimeout(() => this.router.navigate(['/vat-returns']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/vat-returns/view', this.vatId]); }
}