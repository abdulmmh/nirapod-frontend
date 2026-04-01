import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IncomeTaxReturn } from '../../../../models/income-tax-return.model';

@Component({
  selector: 'app-income-tax-return-edit',
  templateUrl: './income-tax-return-edit.component.html',
  styleUrls: ['./income-tax-return-edit.component.css']
})
export class IncomeTaxReturnEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  itrId      = 0;

  itrCategories   = ['Individual', 'Company', 'Partnership', 'NGO'];
  returnPeriods   = ['Annual', 'Quarterly'];
  assessmentYears = ['2024-25', '2023-24', '2022-23', '2021-22'];
  incomeYears     = ['2023-24', '2022-23', '2021-22', '2020-21'];
  statuses        = ['Draft', 'Submitted', 'Accepted', 'Rejected', 'Overdue', 'Under Review', 'Amended'];
  submitters      = ['Taxpayer', 'Tax Officer', 'Data Entry Operator', 'Tax Commissioner'];

  form: any = {};

  get taxableIncome(): number {
    return Math.max(0, (this.form.grossIncome || 0) - (this.form.exemptIncome || 0));
  }

  get netTaxPayable(): number {
    return Math.max(0, (this.form.grossTax || 0) - (this.form.taxRebate || 0));
  }

  get refundable(): number {
    const totalPaid = (this.form.advanceTaxPaid || 0) + (this.form.withholdingTax || 0) + (this.form.taxPaid || 0);
    return Math.max(0, totalPaid - this.netTaxPayable);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itrId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.itrId,
      returnNo: 'ITR-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Abdul Karim',
      itrCategory: 'Individual', assessmentYear: '2024-25',
      incomeYear: '2023-24', returnPeriod: 'Annual',
      grossIncome: 1200000, exemptIncome: 200000,
      taxableIncome: 1000000, taxRate: 15,
      grossTax: 150000, taxRebate: 10000,
      netTaxPayable: 140000, advanceTaxPaid: 50000,
      withholdingTax: 30000, taxPaid: 60000,
      refundable: 0, submissionDate: '2024-11-25',
      dueDate: '2024-11-30', status: 'Accepted',
      submittedBy: 'Taxpayer', verifiedBy: 'Tax Officer', remarks: ''
    };
    this.isLoading = false;
  }

  isFormValid(): boolean {
    return !!(this.form.tinNumber && this.form.taxpayerName &&
              this.form.itrCategory && this.form.assessmentYear);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'Income tax return updated successfully!';
      setTimeout(() => this.router.navigate(['/income-tax-returns']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/income-tax-returns/view', this.itrId]); }
}