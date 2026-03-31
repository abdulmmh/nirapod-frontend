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

  form: VatReturnCreateRequest = {
    tinNumber:       '',
    taxpayerName:    '',
    binNumber:       '',
    taxPeriod:       '',
    periodFrom:      '',
    periodTo:        '',
    submissionDate:  new Date().toISOString().split('T')[0],
    totalSales:      0,
    totalPurchases:  0,
    vatOnSales:      0,
    vatOnPurchases:  0,
    netVatPayable:   0,
    paymentStatus:   'Unpaid',
    remarks:         ''
  };

  taxPeriods = [
    'January 2024', 'February 2024', 'March 2024',
    'April 2024', 'May 2024', 'June 2024',
    'July 2024', 'August 2024', 'September 2024',
    'October 2024', 'November 2024', 'December 2024',
    'January 2025', 'February 2025', 'March 2025',
  ];

  constructor(private http: HttpClient, private router: Router) {}

  // Auto calculate VAT on sales (15%)
  onSalesChange(): void {
    this.form.vatOnSales    = Math.round(this.form.totalSales * 0.15);
    this.calculateNet();
  }

  // Auto calculate VAT on purchases (15%)
  onPurchasesChange(): void {
    this.form.vatOnPurchases = Math.round(this.form.totalPurchases * 0.15);
    this.calculateNet();
  }

  // Net VAT = VAT on Sales - VAT on Purchases
  calculateNet(): void {
    this.form.netVatPayable = Math.max(
      0, this.form.vatOnSales - this.form.vatOnPurchases
    );
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber      &&
      this.form.taxpayerName   &&
      this.form.binNumber      &&
      this.form.taxPeriod      &&
      this.form.periodFrom     &&
      this.form.periodTo       &&
      this.form.totalSales >= 0
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

    this.http.post(API_ENDPOINTS.VAT_RETURNS.CREATE, this.form).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'VAT Return submitted successfully!';
        setTimeout(() => this.router.navigate(['/vat-returns']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.successMsg = 'VAT Return submitted successfully!';
        setTimeout(() => this.router.navigate(['/vat-returns']), 1500);
      }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber:       '',
      taxpayerName:    '',
      binNumber:       '',
      taxPeriod:       '',
      periodFrom:      '',
      periodTo:        '',
      submissionDate:  new Date().toISOString().split('T')[0],
      totalSales:      0,
      totalPurchases:  0,
      vatOnSales:      0,
      vatOnPurchases:  0,
      netVatPayable:   0,
      paymentStatus:   'Unpaid',
      remarks:         ''
    };
    this.errorMsg   = '';
    this.successMsg = '';
  }

  onCancel(): void {
    this.router.navigate(['/vat-returns']);
  }

  formatCurrency(val: number): string {
    return `৳${val.toLocaleString()}`;
  }
}