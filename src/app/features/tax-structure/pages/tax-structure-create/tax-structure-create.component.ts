import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TaxStructureCreateRequest } from '../../../../models/tax-structure.model';

@Component({
  selector: 'app-tax-structure-create',
  templateUrl: './tax-structure-create.component.html',
  styleUrls: ['./tax-structure-create.component.css']
})
export class TaxStructureCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  taxTypes     = ['VAT', 'AIT', 'Import Duty', 'Income Tax', 'Excise Duty', 'Supplementary Duty', 'Other'];
  applicables  = ['All', 'Individual', 'Company', 'Import', 'Export', 'Service', 'Goods'];
  statuses     = ['Active', 'Inactive'];

  form: TaxStructureCreateRequest = {
    taxName: '', taxType: '', rate: 0,
    applicableTo: 'All', effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '', description: '', status: 'Active'
  };

  isFormValid(): boolean {
    return !!(this.form.taxName && this.form.taxType &&
              this.form.rate > 0 && this.form.effectiveDate);
  }

  constructor(private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    setTimeout(() => {
      this.isLoading = false;
      this.successMsg = 'Tax structure created successfully!';
      setTimeout(() => this.router.navigate(['/tax-structure']), 1500);
    }, 800);
  }

  onReset(): void {
    this.form = {
      taxName: '', taxType: '', rate: 0,
      applicableTo: 'All', effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '', description: '', status: 'Active'
    };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/tax-structure']); }
}