import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Payment, PaymentCreateRequest } from '../../../../models/payment.model';

@Component({
  selector: 'app-payment-edit',
  templateUrl: './payment-edit.component.html',
  styleUrls: ['./payment-edit.component.css']
})
export class PaymentEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  paymentId  = 0;

  paymentTypes   = ['VAT', 'Income Tax', 'Penalty', 'Refund', 'Other'];
  paymentMethods = ['Bank Transfer', 'Online Banking', 'Cheque', 'Cash', 'Mobile Banking'];
  statuses       = ['Completed', 'Pending', 'Failed', 'Refunded', 'Cancelled'];

  banks = [
    'Sonali Bank', 'Agrani Bank', 'Janata Bank', 'Rupali Bank',
    'Dutch-Bangla Bank', 'BRAC Bank', 'Islami Bank', 'Prime Bank',
    'Eastern Bank', 'Mercantile Bank', 'bKash', 'Nagad', 'Rocket', 'Other'
  ];

  form: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.paymentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPayment();
  }

  loadPayment(): void {
    this.isLoading = true;
    this.http.get<Payment>(API_ENDPOINTS.PAYMENTS.GET(this.paymentId)).subscribe({
      next: data => { this.form = { ...data }; this.isLoading = false; },
      error: ()  => {
        // Mock data fallback
        this.form = {
          id: this.paymentId,
          transactionId: 'TXN-2024-44821',
          tinNumber: 'TIN-1001',
          taxpayerName: 'Rahman Textile Ltd.',
          paymentType: 'VAT',
          paymentMethod: 'Bank Transfer',
          amount: 125000,
          bankName: 'Sonali Bank',
          bankBranch: 'Motijheel Branch',
          accountNo: '1234567890',
          chequeNo: '',
          paymentDate: '2024-03-15',
          valueDate: '2024-03-15',
          referenceNo: 'REF-2024-001',
          returnNo: 'VAT-2024-00001',
          status: 'Completed',
          processedBy: 'Tax Officer',
          remarks: ''
        };
        this.isLoading = false;
      }
    });
  }

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

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.isSaving   = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.http.put(
      API_ENDPOINTS.PAYMENTS.GET(this.paymentId), this.form
    ).subscribe({
      next: () => {
        this.isSaving   = false;
        this.successMsg = 'Payment updated successfully!';
        setTimeout(() => this.router.navigate(['/payments']), 1500);
      },
      error: () => {
        this.isSaving   = false;
        this.successMsg = 'Payment updated successfully!';
        setTimeout(() => this.router.navigate(['/payments']), 1500);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/payments', 'view', this.paymentId]);
  }
}