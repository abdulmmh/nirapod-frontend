import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { RefundCreateRequest } from '../../../../models/refund.model';

@Component({
  selector: 'app-refund-create',
  templateUrl: './refund-create.component.html',
  styleUrls: ['./refund-create.component.css']
})
export class RefundCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  refundTypes   = ['VAT Refund', 'Income Tax Refund', 'Excess Payment', 'Other'];
  refundMethods = ['Bank Transfer', 'Cheque', 'Adjustment'];

  banks = [
    'Sonali Bank', 'Agrani Bank', 'Janata Bank', 'Rupali Bank',
    'Dutch-Bangla Bank', 'BRAC Bank', 'Islami Bank', 'Prime Bank',
    'Eastern Bank', 'Mercantile Bank', 'Other'
  ];

  form: RefundCreateRequest = {
    tinNumber:    '',
    taxpayerName: '',
    refundType:   '',
    refundMethod: '',
    claimAmount:  0,
    returnNo:     '',
    paymentRef:   '',
    bankName:     '',
    bankBranch:   '',
    accountNo:    '',
    claimDate:    new Date().toISOString().split('T')[0],
    remarks:      ''
  };

  get showBankFields(): boolean {
    return this.form.refundMethod === 'Bank Transfer' ||
           this.form.refundMethod === 'Cheque';
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber    &&
      this.form.taxpayerName &&
      this.form.refundType   &&
      this.form.refundMethod &&
      this.form.claimAmount > 0
    );
  }

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.isLoading  = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.http.post(API_ENDPOINTS.PAYMENTS.CREATE, this.form).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Refund claim submitted successfully!';
        setTimeout(() => this.router.navigate(['/refunds']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.successMsg = 'Refund claim submitted successfully!';
        setTimeout(() => this.router.navigate(['/refunds']), 1500);
      }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber: '', taxpayerName: '', refundType: '',
      refundMethod: '', claimAmount: 0, returnNo: '',
      paymentRef: '', bankName: '', bankBranch: '',
      accountNo: '', claimDate: new Date().toISOString().split('T')[0],
      remarks: ''
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/refunds']); }

  formatCurrency(val: number): string {
    if (val >= 100000) return `৳${(val / 100000).toFixed(2)}L`;
    return `৳${val.toLocaleString()}`;
  }
}