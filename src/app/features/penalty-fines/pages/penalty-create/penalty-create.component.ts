import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { PenaltyCreateRequest } from '../../../../models/penalty.model';

@Component({
  selector: 'app-penalty-create',
  templateUrl: './penalty-create.component.html',
  styleUrls: ['./penalty-create.component.css']
})
export class PenaltyCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  penaltyTypes  = ['Late Filing', 'Late Payment', 'Non-Compliance', 'Fraud', 'Underpayment', 'Other'];
  severities    = ['Low', 'Medium', 'High', 'Critical'];
  assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];
  officers = [
    'Tax Officer', 'Senior Tax Officer', 'Tax Commissioner',
    'Assistant Commissioner', 'Deputy Commissioner'
  ];

  form: PenaltyCreateRequest = {
    tinNumber:      '',
    taxpayerName:   '',
    penaltyType:    '',
    severity:       'Medium',
    penaltyAmount:  0,
    interestAmount: 0,
    returnNo:       '',
    assessmentYear: '2024-25',
    issueDate:      new Date().toISOString().split('T')[0],
    dueDate:        '',
    issuedBy:       '',
    description:    '',
    remarks:        ''
  };

  // Auto calculate interest at 15% of penalty
  onPenaltyChange(): void {
    this.form.interestAmount = Math.round(this.form.penaltyAmount * 0.15);
    this.setDefaultDueDate();
  }

  get totalAmount(): number {
    return this.form.penaltyAmount + this.form.interestAmount;
  }

   setDefaultDueDate(): void {
    if (this.form.issueDate) {
      const due = new Date(this.form.issueDate);
      due.setDate(due.getDate() + 30);
      this.form.dueDate = due.toISOString().split('T')[0];
    }
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber     &&
      this.form.taxpayerName  &&
      this.form.penaltyType   &&
      this.form.severity      &&
      this.form.penaltyAmount > 0 &&
      this.form.issuedBy      &&
      this.form.dueDate
    );
  }

  constructor(private http: HttpClient, private router: Router) {
    this.setDefaultDueDate();
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.isLoading  = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.http.post(API_ENDPOINTS.PENALTIES.CREATE, this.form).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Penalty issued successfully!';
        setTimeout(() => this.router.navigate(['/penalties']), 1500);
      },
      error: () => {
        this.isLoading  = false;
        this.successMsg = '';
        this.errorMsg   = 'Failed to issue penalty. Please try again.';
      }
    });
  }

  onReset(): void {
    this.form = {
      tinNumber: '', taxpayerName: '', penaltyType: '',
      severity: 'Medium', penaltyAmount: 0, interestAmount: 0,
      returnNo: '', assessmentYear: '2024-25',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '', issuedBy: '', description: '', remarks: ''
    };
    this.setDefaultDueDate();
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/penalties']); }

  fmt(val: number): string {
    if (val >= 100000) return `৳${(val / 100000).toFixed(2)}L`;
    return `৳${val.toLocaleString()}`;
  }
}