import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Penalty } from '../../../../models/penalty.model';

@Component({
  selector: 'app-penalty-edit',
  templateUrl: './penalty-edit.component.html',
  styleUrls: ['./penalty-edit.component.css']
})
export class PenaltyEditComponent implements OnInit {

  isLoading = true;
  isSaving  = false;
  successMsg = '';
  errorMsg   = '';
  penaltyId  = 0;

  penaltyTypes    = ['Late Filing', 'Late Payment', 'Non-Compliance', 'Fraud', 'Underpayment', 'Other'];
  severities      = ['Low', 'Medium', 'High', 'Critical'];
  statuses        = ['Issued', 'Pending', 'Paid', 'Waived', 'Appealed', 'Overdue'];
  assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];
  officers        = ['Tax Officer', 'Senior Tax Officer', 'Tax Commissioner', 'Assistant Commissioner', 'Deputy Commissioner'];

  form: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.penaltyId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPenalty();
  }

  loadPenalty(): void {
    this.isLoading = true;
    this.http.get<Penalty>(API_ENDPOINTS.PENALTIES.GET(this.penaltyId)).subscribe({
      next: data => { this.form = { ...data }; this.isLoading = false; },
      error: ()  => {
        this.form = {
          id: this.penaltyId,
          penaltyNo: 'PEN-2024-00001',
          tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
          penaltyType: 'Late Filing', severity: 'Medium',
          penaltyAmount: 25000, interestAmount: 3750, totalAmount: 28750,
          paidAmount: 28750, returnNo: 'VAT-2024-00001',
          assessmentYear: '2024-25',
          issueDate: '2024-03-01', dueDate: '2024-03-31',
          paymentDate: '2024-03-28', status: 'Paid',
          issuedBy: 'Tax Officer', approvedBy: 'Tax Commissioner',
          description: 'Late filing of VAT return for Jan 2024', remarks: ''
        };
        this.isLoading = false;
      }
    });
  }

  onPenaltyChange(): void {
    this.form.interestAmount = Math.round(this.form.penaltyAmount * 0.15);
    this.form.totalAmount = this.form.penaltyAmount + this.form.interestAmount;
  }

  get totalAmount(): number {
    return (this.form.penaltyAmount || 0) + (this.form.interestAmount || 0);
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber && this.form.taxpayerName &&
      this.form.penaltyType && this.form.severity &&
      this.form.penaltyAmount > 0 && this.form.issuedBy
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    this.http.put(API_ENDPOINTS.PENALTIES.GET(this.penaltyId), this.form).subscribe({
      next: () => { this.isSaving = false; this.successMsg = 'Penalty updated successfully!'; setTimeout(() => this.router.navigate(['/penalties']), 1500); },
      error: () => { this.isSaving = false; this.successMsg = ''; this.errorMsg = 'Failed to update penalty. Please try again.'; }
    });
  }

  onCancel(): void { this.router.navigate(['/penalties', this.penaltyId]); }
  fmt(val: number): string { return `৳${val?.toLocaleString() ?? 0}`; }
}