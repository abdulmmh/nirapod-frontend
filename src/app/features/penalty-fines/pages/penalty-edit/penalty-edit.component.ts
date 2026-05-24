import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, timer } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Penalty } from '../../../../models/penalty.model';
import { PenaltyService } from '../../services/penalty.service';

@Component({
  selector: 'app-penalty-edit',
  templateUrl: './penalty-edit.component.html',
  styleUrls: ['./penalty-edit.component.css'],
})
export class PenaltyEditComponent implements OnInit, OnDestroy {
  isLoading = true;
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  penaltyId = 0;

  penaltyTypes = [
    'Late Filing',
    'Late Payment',
    'Non-Compliance',
    'Fraud',
    'Underpayment',
    'Other',
  ];
  severities = ['Low', 'Medium', 'High', 'Critical'];
  statuses = ['Issued', 'Pending', 'Paid', 'Waived', 'Appealed', 'Overdue'];
  assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];
  officers = [
    'Tax Officer',
    'Senior Tax Officer',
    'Tax Commissioner',
    'Assistant Commissioner',
    'Deputy Commissioner',
  ];

  form: any = {};
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
    private penaltyService: PenaltyService,
  ) {}

  ngOnInit(): void {
    this.penaltyId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPenalty();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPenalty(): void {
    this.isLoading = true;
    this.penaltyService
      .getById(this.penaltyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.form = { ...data };
          this.isLoading = false;
          if (data.status !== 'DRAFT') {
            this.errorMsg = `This penalty is "${data.status}" — only DRAFT penalties can be edited.`;
          }
        },
        error: () => {
          this.form = {
            id: this.penaltyId,
            penaltyNo: 'PEN-2024-00001',
            tinNumber: 'TIN-1001',
            taxpayerName: 'Rahman Textile Ltd.',
            penaltyType: 'Late Filing',
            severity: 'Medium',
            penaltyAmount: 25000,
            interestAmount: 3750,
            totalAmount: 28750,
            paidAmount: 28750,
            returnNo: 'VAT-2024-00001',
            assessmentYear: '2024-25',
            issueDate: '2024-03-01',
            dueDate: '2024-03-31',
            paymentDate: '2024-03-28',
            status: 'Paid',
            issuedBy: 'Tax Officer',
            approvedBy: 'Tax Commissioner',
            description: 'Late filing of VAT return for Jan 2024',
            remarks: '',
          };
          this.isLoading = false;
        },
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
    if (this.form.status !== 'DRAFT') return false; // ← যোগ করো
    return !!(
      this.form.penaltyType &&
      this.form.severity &&
      this.form.penaltyAmount > 0 &&
      this.form.issuedBy
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.toast.error('Please fill in all required fields.');
      return;
    }
    this.isSaving = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.penaltyService
      .update(this.penaltyId, this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMsg = 'Penalty updated successfully!';
          this.toast.success('Penalty updated successfully!');
          timer(1500)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['/penalties']));
        },
        error: () => {
          this.isSaving = false;
          this.successMsg = '';
          this.errorMsg = 'Failed to update penalty. Please try again.';
          this.toast.error('Failed to update penalty. Please try again.');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/penalties', this.penaltyId]);
  }
  fmt(val: number): string {
    return `৳${val?.toLocaleString() ?? 0}`;
  }
}
