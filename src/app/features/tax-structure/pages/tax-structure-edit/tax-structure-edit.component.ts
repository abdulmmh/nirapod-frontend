import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxStructure } from '../../../../models/tax-structure.model';

@Component({
  selector: 'app-tax-structure-edit',
  templateUrl: './tax-structure-edit.component.html',
  styleUrls: ['./tax-structure-edit.component.css']
})
export class TaxStructureEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  taxId      = 0;

  taxTypes    = ['VAT', 'AIT', 'Import Duty', 'Income Tax', 'Excise Duty', 'Supplementary Duty', 'Other'];
  applicables = ['All', 'Individual', 'Company', 'Import', 'Export', 'Service', 'Goods'];
  statuses    = ['Active', 'Inactive', 'Expired'];

  form: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taxId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = {
      id: this.taxId, taxCode: 'TAX-001',
      taxName: 'Standard VAT', taxType: 'VAT',
      rate: 15, applicableTo: 'All',
      effectiveDate: '2024-01-01', expiryDate: '',
      description: 'Standard VAT rate applicable to all taxable goods and services',
      status: 'Active', createdBy: 'Tax Commissioner', createdAt: '2024-01-01'
    };
    this.isLoading = false;
  }

  get ratePreview(): number { return Math.round(100000 * this.form.rate / 100); }

  isFormValid(): boolean {
    return !!(this.form.taxName && this.form.taxType &&
              this.form.rate > 0 && this.form.effectiveDate);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isSaving = true; this.errorMsg = ''; this.successMsg = '';
    setTimeout(() => {
      this.isSaving = false;
      this.successMsg = 'Tax structure updated successfully!';
      setTimeout(() => this.router.navigate(['/tax-structure']), 1500);
    }, 800);
  }

  onCancel(): void { this.router.navigate(['/tax-structure/view', this.taxId]); }
}