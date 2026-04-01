import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FiscalYearCreateRequest } from '../../../../models/fiscal-year.model';

@Component({
  selector: 'app-fiscal-year-create',
  templateUrl: './fiscal-year-create.component.html',
  styleUrls: ['./fiscal-year-create.component.css']
})
export class FiscalYearCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  statuses = ['Active', 'Upcoming', 'Closed'];
  vatDueDays = [10, 15, 20, 25, 30];

  form: FiscalYearCreateRequest = {
    yearName: '', startDate: '', endDate: '',
    vatDueDay: 15, incomeTaxDueDate: '',
    isCurrentYear: false, status: 'Upcoming'
  };

  onYearNameChange(): void {
    // Auto fill dates from year name e.g. "2025-26"
    const match = this.form.yearName.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const startYear = match[1];
      const endYear   = '20' + match[2];
      this.form.startDate = `${startYear}-07-01`;
      this.form.endDate   = `${endYear}-06-30`;
      this.form.incomeTaxDueDate = `${startYear}-11-30`;
    }
  }

  isFormValid(): boolean {
    return !!(this.form.yearName && this.form.startDate &&
              this.form.endDate && this.form.vatDueDay);
  }

  constructor(private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    setTimeout(() => {
      this.isLoading = false;
      this.successMsg = 'Fiscal year created successfully!';
      setTimeout(() => this.router.navigate(['/fiscal-years']), 1500);
    }, 800);
  }

  onReset(): void {
    this.form = { yearName: '', startDate: '', endDate: '', vatDueDay: 15, incomeTaxDueDate: '', isCurrentYear: false, status: 'Upcoming' };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/fiscal-years']); }
}