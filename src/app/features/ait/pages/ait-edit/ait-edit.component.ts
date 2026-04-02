import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-ait-edit',
  templateUrl: './ait-edit.component.html',
  styleUrls: ['./ait-edit.component.css']
})
export class AitEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  aitId      = 0;

  statuses    = ['Draft', 'Deducted', 'Deposited', 'Credited', 'Disputed'];
  fiscalYears = ['2024-25', '2023-24', '2022-23'];
  sourceTypes = ['Salary', 'Import', 'Contract', 'Interest', 'Dividend', 'Commission', 'Export'];

  form: any = {};

  get aitAmount(): number {
    return Math.round((this.form.grossAmount || 0) * (this.form.aitRate || 0) / 100);
  }

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.aitId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.aitId, aitRef: 'AIT-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Abdul Karim',
      sourceType: 'Salary', taxStructureId: 3,
      grossAmount: 500000, aitRate: 10, aitAmount: 50000,
      deductionDate: '2024-01-31', depositDate: '2024-02-07',
      deductedBy: 'ABC Company Ltd.',
      fiscalYear: '2024-25', status: 'Deposited', remarks: ''
    };
    this.isLoading = false;
  }

  isFormValid(): boolean {
    return !!(this.form.tinNumber && this.form.grossAmount > 0 && this.form.deductedBy);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'AIT record updated successfully!';
      setTimeout(() => this.router.navigate(['/ait']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/ait/view', this.aitId]); }
}