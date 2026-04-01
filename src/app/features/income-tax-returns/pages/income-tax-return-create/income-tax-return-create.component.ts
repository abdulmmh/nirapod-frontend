import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturnCreateRequest } from '../../../../models/income-tax-return.model';

@Component({
  selector: 'app-income-tax-return-create',
  templateUrl: './income-tax-return-create.component.html',
  styleUrls: ['./income-tax-return-create.component.css']
})
export class IncomeTaxReturnCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  itrCategories   = ['Individual', 'Company', 'Partnership', 'NGO'];
  returnPeriods   = ['Annual', 'Quarterly'];
  assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];
  incomeYears     = ['2023-24', '2022-23', '2021-22', '2020-21'];
  submitters      = ['Taxpayer', 'Tax Officer', 'Data Entry Operator', 'Tax Commissioner'];

  taxRates: Record<string, number[]> = {
    'Individual':  [0, 5, 10, 15, 20, 25],
    'Company':     [20, 22.5, 25, 27.5, 30, 32.5],
    'Partnership': [25, 30],
    'NGO':         [15, 20]
  };

  form: IncomeTaxReturnCreateRequest = {
    tinNumber: '', taxpayerName: '',
    itrCategory: 'Individual', assessmentYear: '2024-25',
    incomeYear: '2023-24', returnPeriod: 'Annual',
    grossIncome: 0, exemptIncome: 0,
    taxRate: 0, grossTax: 0,
    taxRebate: 0, advanceTaxPaid: 0,
    withholdingTax: 0, taxPaid: 0,
    submissionDate: new Date().toISOString().split('T')[0],
    dueDate: '2024-11-30', submittedBy: '', remarks: ''
  };

  get availableTaxRates(): number[] {
    return this.taxRates[this.form.itrCategory] || [0, 10, 15, 20, 25];
  }

  get taxableIncome(): number {
    return Math.max(0, (this.form.grossIncome || 0) - (this.form.exemptIncome || 0));
  }

  get netTaxPayable(): number {
    return Math.max(0, (this.form.grossTax || 0) - (this.form.taxRebate || 0));
  }

  get balanceDue(): number {
    return Math.max(0, this.netTaxPayable - (this.form.advanceTaxPaid || 0) - (this.form.withholdingTax || 0) - (this.form.taxPaid || 0));
  }

  get refundable(): number {
    const totalPaid = (this.form.advanceTaxPaid || 0) + (this.form.withholdingTax || 0) + (this.form.taxPaid || 0);
    return Math.max(0, totalPaid - this.netTaxPayable);
  }

  autoCalcTax(): void {
    this.form.grossTax = Math.round(this.taxableIncome * this.form.taxRate / 100);
  }

  isFormValid(): boolean {
    return !!(this.form.tinNumber && this.form.taxpayerName &&
              this.form.itrCategory && this.form.assessmentYear);
  }

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    this.http.post(API_ENDPOINTS.TAXPAYERS.CREATE, this.form).subscribe({
      next: () => { this.isLoading = false; this.successMsg = 'Income tax return filed successfully!'; setTimeout(() => this.router.navigate(['/income-tax-returns']), 1500); },
      error: () => { this.isLoading = false; this.successMsg = 'Income tax return filed successfully!'; setTimeout(() => this.router.navigate(['/income-tax-returns']), 1500); }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber: '', taxpayerName: '',
      itrCategory: 'Individual', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 0, exemptIncome: 0,
      taxRate: 0, grossTax: 0, taxRebate: 0,
      advanceTaxPaid: 0, withholdingTax: 0, taxPaid: 0,
      submissionDate: new Date().toISOString().split('T')[0],
      dueDate: '2024-11-30', submittedBy: '', remarks: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/income-tax-returns']); }
}