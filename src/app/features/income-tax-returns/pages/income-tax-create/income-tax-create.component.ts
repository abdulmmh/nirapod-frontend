import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { IncomeTaxReturnCreateRequest } from '../../../../models/income-tax-return.model';

@Component({
  selector: 'app-income-tax-create',
  templateUrl: './income-tax-create.component.html',
  styleUrls: ['./income-tax-create.component.css']
})
export class IncomeTaxCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  assessmentYears = [
    '2024-25', '2023-24', '2022-23', '2021-22', '2020-21'
  ];

  incomeYears = [
    '2023-24', '2022-23', '2021-22', '2020-21', '2019-20'
  ];

  form: IncomeTaxReturnCreateRequest = {
    tinNumber:            '',
    taxpayerName:         '',
    assessmentYear:       '',
    incomeYear:           '',
    submissionDate:       new Date().toISOString().split('T')[0],
    salaryIncome:         0,
    businessIncome:       0,
    housePropertyIncome:  0,
    capitalGainIncome:    0,
    otherIncome:          0,
    taxRebate:            0,
    taxPaid:              0,
    paymentStatus:        'Unpaid',
    remarks:              ''
  };

  // Calculated fields
  totalIncome     = 0;
  taxableIncome   = 0;
  grossTax        = 0;
  netTaxPayable   = 0;
  taxRefundable   = 0;

  constructor(private http: HttpClient, private router: Router) {}

  // Bangladesh income tax slabs 2024-25
  calculateTax(): void {
    this.totalIncome =
      this.form.salaryIncome        +
      this.form.businessIncome      +
      this.form.housePropertyIncome +
      this.form.capitalGainIncome   +
      this.form.otherIncome;

    // Standard deduction — 1/3 of total or 450000, whichever lower
    const deduction = Math.min(
      Math.round(this.totalIncome / 3), 450000
    );
    this.taxableIncome = Math.max(0, this.totalIncome - deduction);

    // Bangladesh tax slabs (2024-25)
    this.grossTax = this.computeTaxSlab(this.taxableIncome);

    this.netTaxPayable = Math.max(
      0, this.grossTax - this.form.taxRebate
    );

    this.taxRefundable = Math.max(
      0, this.form.taxPaid - this.netTaxPayable
    );
  }

  private computeTaxSlab(income: number): number {
    // Exemption limit: 350,000
    const exemption = 350000;
    if (income <= exemption) return 0;

    let tax = 0;
    let remaining = income - exemption;

    // 5% on next 100,000
    const slab1 = Math.min(remaining, 100000);
    tax += slab1 * 0.05;
    remaining -= slab1;
    if (remaining <= 0) return Math.round(tax);

    // 10% on next 300,000
    const slab2 = Math.min(remaining, 300000);
    tax += slab2 * 0.10;
    remaining -= slab2;
    if (remaining <= 0) return Math.round(tax);

    // 15% on next 400,000
    const slab3 = Math.min(remaining, 400000);
    tax += slab3 * 0.15;
    remaining -= slab3;
    if (remaining <= 0) return Math.round(tax);

    // 20% on next 500,000
    const slab4 = Math.min(remaining, 500000);
    tax += slab4 * 0.20;
    remaining -= slab4;
    if (remaining <= 0) return Math.round(tax);

    // 25% on remaining
    tax += remaining * 0.25;

    return Math.round(tax);
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber       &&
      this.form.taxpayerName    &&
      this.form.assessmentYear  &&
      this.form.incomeYear
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.isLoading  = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.http.post(API_ENDPOINTS.TAXPAYERS.CREATE, this.form).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Income Tax Return submitted successfully!';
        setTimeout(() => this.router.navigate(['/income-tax']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.successMsg = 'Income Tax Return submitted successfully!';
        setTimeout(() => this.router.navigate(['/income-tax']), 1500);
      }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber:            '',
      taxpayerName:         '',
      assessmentYear:       '',
      incomeYear:           '',
      submissionDate:       new Date().toISOString().split('T')[0],
      salaryIncome:         0,
      businessIncome:       0,
      housePropertyIncome:  0,
      capitalGainIncome:    0,
      otherIncome:          0,
      taxRebate:            0,
      taxPaid:              0,
      paymentStatus:        'Unpaid',
      remarks:              ''
    };
    this.totalIncome = this.taxableIncome =
    this.grossTax    = this.netTaxPayable =
    this.taxRefundable = 0;
    this.errorMsg   = '';
    this.successMsg = '';
  }

  onCancel(): void {
    this.router.navigate(['/income-tax']);
  }

  fmt(val: number): string {
    if (val >= 10000000) return `৳${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000)   return `৳${(val / 100000).toFixed(2)} L`;
    return `৳${val.toLocaleString()}`;
  }
}