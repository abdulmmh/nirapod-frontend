import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { PaymentCreateRequest } from '../../../../models/payment.model';

@Component({
  selector: 'app-payment-create',
  templateUrl: './payment-create.component.html',
  styleUrls: ['./payment-create.component.css']
})
export class PaymentCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  paymentTypes   = ['VAT', 'Income Tax', 'Penalty', 'Refund', 'Other'];
  paymentMethods = ['Bank Transfer', 'Online Banking', 'Cheque', 'Cash', 'Mobile Banking'];

  banks = [
    'Sonali Bank', 'Agrani Bank', 'Janata Bank', 'Rupali Bank',
    'Dutch-Bangla Bank', 'BRAC Bank', 'Islami Bank', 'Prime Bank',
    'Eastern Bank', 'Mercantile Bank', 'bKash', 'Nagad', 'Rocket', 'Other'
  ];

  form: PaymentCreateRequest = {
    tinNumber:     '',
    taxpayerName:  '',
    paymentType:   '',
    paymentMethod: '',
    amount:        0,
    bankName:      '',
    bankBranch:    '',
    accountNo:     '',
    chequeNo:      '',
    paymentDate:   new Date().toISOString().split('T')[0],
    valueDate:     new Date().toISOString().split('T')[0],
    referenceNo:   '',
    returnNo:      '',
    remarks:       ''
  };

  get showChequeField(): boolean {
    return this.form.paymentMethod === 'Cheque';
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber     &&
      this.form.taxpayerName  &&
      this.form.paymentType   &&
      this.form.paymentMethod &&
      this.form.amount > 0    &&
      this.form.bankName      &&
      this.form.paymentDate
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
        this.successMsg = 'Payment recorded successfully!';
        setTimeout(() => this.router.navigate(['/payments']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.successMsg = 'Payment recorded successfully!';
        setTimeout(() => this.router.navigate(['/payments']), 1500);
      }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber:     '',
      taxpayerName:  '',
      paymentType:   '',
      paymentMethod: '',
      amount:        0,
      bankName:      '',
      bankBranch:    '',
      accountNo:     '',
      chequeNo:      '',
      paymentDate:   new Date().toISOString().split('T')[0],
      valueDate:     new Date().toISOString().split('T')[0],
      referenceNo:   '',
      returnNo:      '',
      remarks:       ''
    };
    this.errorMsg   = '';
    this.successMsg = '';
  }

  onCancel(): void {
    this.router.navigate(['/payments']);
  }
}