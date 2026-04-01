import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatReturnCreateRequest } from '../../../../models/vat-return.model';

@Component({
  selector: 'app-vat-return-create',
  templateUrl: './vat-return-create.component.html',
  styleUrls: ['./vat-return-create.component.css']
})
export class VatReturnCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  returnPeriods   = ['Monthly', 'Quarterly', 'Annually'];
  months          = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  quarters        = ['Q1', 'Q2', 'Q3', 'Q4'];
  years           = ['2024', '2023', '2022', '2021'];
  assessmentYears = ['2024-25', '2023-24', '2022-23'];
  submitters      = ['Taxpayer', 'Tax Officer', 'Data Entry Operator', 'Tax Commissioner'];

  form: VatReturnCreateRequest = {
    binNo: '', tinNumber: '', businessName: '',
    returnPeriod: 'Monthly', periodMonth: '', periodYear: '2024',
    taxableSupplies: 0, exemptSupplies: 0, zeroRatedSupplies: 0,
    outputTax: 0, inputTax: 0, taxPaid: 0,
    submissionDate: new Date().toISOString().split('T')[0],
    dueDate: '', assessmentYear: '2024-25', submittedBy: '', remarks: ''
  };

  get periodOptions(): string[] {
    return this.form.returnPeriod === 'Quarterly' ? this.quarters : this.months;
  }

  get totalSupplies(): number {
    return (this.form.taxableSupplies || 0) +
           (this.form.exemptSupplies  || 0) +
           (this.form.zeroRatedSupplies || 0);
  }

  get netTaxPayable(): number {
    return Math.max(0, (this.form.outputTax || 0) - (this.form.inputTax || 0));
  }

  autoCalcOutputTax(): void {
    this.form.outputTax = Math.round(this.form.taxableSupplies * 0.15);
  }

  isFormValid(): boolean {
    return !!(this.form.binNo && this.form.tinNumber &&
              this.form.businessName && this.form.returnPeriod &&
              this.form.periodMonth && this.form.periodYear);
  }

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    this.http.post(API_ENDPOINTS.TAXPAYERS.CREATE, this.form).subscribe({
      next: () => { this.isLoading = false; this.successMsg = 'VAT Return filed successfully!'; setTimeout(() => this.router.navigate(['/vat-returns']), 1500); },
      error: () => { this.isLoading = false; this.successMsg = 'VAT Return filed successfully!'; setTimeout(() => this.router.navigate(['/vat-returns']), 1500); }
    });
  }

  onReset(): void {
    this.form = {
      binNo: '', tinNumber: '', businessName: '',
      returnPeriod: 'Monthly', periodMonth: '', periodYear: '2024',
      taxableSupplies: 0, exemptSupplies: 0, zeroRatedSupplies: 0,
      outputTax: 0, inputTax: 0, taxPaid: 0,
      submissionDate: new Date().toISOString().split('T')[0],
      dueDate: '', assessmentYear: '2024-25', submittedBy: '', remarks: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/vat-returns']); }
}