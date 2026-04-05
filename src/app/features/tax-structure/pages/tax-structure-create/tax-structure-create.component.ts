import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TaxStructureCreateRequest } from '../../../../models/tax-structure.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tax-structure-create',
  templateUrl: './tax-structure-create.component.html',
  styleUrls: ['./tax-structure-create.component.css']
})
export class TaxStructureCreateComponent {

  isLoading = false;
  successMsg = '';
  errorMsg = '';

  taxTypes = ['VAT', 'AIT', 'Import Duty', 'Income Tax', 'Excise Duty', 'Supplementary Duty', 'Other'];
  applicables = ['All', 'Individual', 'Company', 'Import', 'Export', 'Service', 'Goods'];
  statuses = ['Active', 'Inactive'];

  form: TaxStructureCreateRequest = {
    taxCode: '',
    taxName: 'Standard VAT',
    taxType: 'VAT',
    rate: 15,
    applicableTo: 'All',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '2026-12-31',
    description: 'Standard VAT rate applicable to all taxable goods and services',
    status: 'Active'
  };

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  isFormValid(): boolean {
    return !!(
      this.form.taxCode &&
      this.form.taxName &&
      this.form.taxType &&
      this.form.rate > 0 &&
      this.form.effectiveDate
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.successMsg = '';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.post(API_ENDPOINTS.TAX_STRUCTURES.CREATE, this.form).subscribe({
      next: (res) => {
        console.log('Created successfully', res);
        this.isLoading = false;
        this.successMsg = 'Tax structure created successfully!';
        setTimeout(() => this.router.navigate(['/tax-structure']), 1500);
      },
      error: (err) => {
        console.error('Create failed', err);
        this.isLoading = false;

        if (err.status === 400) {
          this.errorMsg = 'Invalid input. Please check the form.';
        } else if (err.status === 409) {
          this.errorMsg = 'Tax Code or Tax Name already exists.';
        } else {
          this.errorMsg = 'Create failed. Please try again.';
        }
      }
    });
  }

  onReset(): void {
    this.form = {
      taxCode: '',
      taxName: 'Standard VAT',
      taxType: 'VAT',
      rate: 15,
      applicableTo: 'All',
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-12-31',
      description: 'Standard VAT rate applicable to all taxable goods and services',
      status: 'Active'
    };

    this.errorMsg = '';
    this.successMsg = '';
  }

  onCancel(): void {
    this.router.navigate(['/tax-structure']);
  }
}