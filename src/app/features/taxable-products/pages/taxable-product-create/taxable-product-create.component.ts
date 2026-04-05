import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TaxableProductCreateRequest } from '../../../../models/taxable-product.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-taxable-product-create',
  templateUrl: './taxable-product-create.component.html',
  styleUrls: ['./taxable-product-create.component.css']
})
export class TaxableProductCreateComponent {

  isLoading  = false;
  successMsg = '';
  errorMsg   = '';

  categories = ['Electronics', 'Textile', 'Food & Beverage', 'Pharmaceutical', 'Machinery', 'Chemicals', 'Vehicles', 'Agriculture', 'Luxury', 'Other'];
  units      = ['Piece', 'KG', 'Meter', 'Liter', 'Pack', 'Unit', 'Ton', 'Set', 'Box', 'Dozen'];
  statuses   = ['Active', 'Inactive', 'Restricted'];

  // Tax structures from system — in real app fetch from API
  taxStructures = [
    { id: 1, name: 'Standard VAT (15%)', type: 'VAT', rate: 15 },
    { id: 2, name: 'Reduced VAT (5%)', type: 'VAT', rate: 5 },
    { id: 3, name: 'AIT on Salary (10%)', type: 'AIT', rate: 10 },
    { id: 4, name: 'AIT on Import (5%)', type: 'AIT', rate: 5 },
    { id: 5, name: 'General Import Duty (25%)', type: 'Import Duty', rate: 25 },
    { id: 6, name: 'Electronics Import Duty (10%)', type: 'Import Duty', rate: 10 },
    { id: 7, name: 'Supplementary Duty (20%)', type: 'Supplementary Duty', rate: 20 },
  ];

  form: TaxableProductCreateRequest = {
    productName: 'Mobile Phone', hsCode: '8517.12.00', category: 'Electronics', taxType: 'VAT', taxStructureId: 1, taxRate: 15, unit: 'Piece', description: 'Mobile phones and smartphones', status: 'Active'
  };

  onTaxStructureChange(): void {
    const selected = this.taxStructures.find(t => t.id === Number(this.form.taxStructureId));
    if (selected) {
      this.form.taxType = selected.type;
      this.form.taxRate = selected.rate;
    }
  }

  isFormValid(): boolean {
    return !!(this.form.productName && this.form.hsCode &&
              this.form.category && this.form.unit);
  }

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.successMsg = '';
      return;
    }
    console.log('Submitting form:', this.form);
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.post(API_ENDPOINTS.TAXABLE_PRODUCTS.CREATE, this.form).subscribe({
      next: (res) => {
        console.log('Created successfully', res);
        this.isLoading = false;
        this.successMsg = 'Taxable product created successfully!';
        setTimeout(() => this.router.navigate(['/taxable-products']), 1500);
      },
      error: (err) => {
        console.error('Create failed', err);
        this.isLoading = false;

        if (err.status === 400) {
          this.errorMsg = 'Invalid input. Please check the form.';
        } else {
          this.errorMsg = 'Create failed. Please try again.';
        }
      }
    });
  }

  onReset(): void {
    this.form = { productName: 'Mobile Phone', hsCode: '8517.12.00', category: 'Electronics', taxType: 'VAT', taxStructureId: 1, taxRate: 15, unit: 'Piece', description: 'Mobile phones and smartphones', status: 'Active' };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/taxable-products']); }
}