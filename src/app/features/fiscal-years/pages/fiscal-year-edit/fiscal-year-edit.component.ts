import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FiscalYear } from '../../../../models/fiscal-year.model';

@Component({
  selector: 'app-fiscal-year-edit',
  templateUrl: './fiscal-year-edit.component.html',
  styleUrls: ['./fiscal-year-edit.component.css']
})
export class FiscalYearEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  fyId       = 0;

  statuses   = ['Active', 'Upcoming', 'Closed'];
  vatDueDays = [10, 15, 20, 25, 30];

  form: any = {};

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.fyId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.fyId, yearName: '2024-25',
      startDate: '2024-07-01', endDate: '2025-06-30',
      vatDueDay: 15, incomeTaxDueDate: '2024-11-30',
      isCurrentYear: true, status: 'Active'
    };
    this.isLoading = false;
  }

  isFormValid(): boolean {
    return !!(this.form.yearName && this.form.startDate &&
              this.form.endDate && this.form.vatDueDay);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'Fiscal year updated successfully!';
      setTimeout(() => this.router.navigate(['/fiscal-years']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/fiscal-years']); }
}