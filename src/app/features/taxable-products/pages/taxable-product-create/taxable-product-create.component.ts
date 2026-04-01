import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TaxableProductCreateRequest } from '../../../../models/taxable-product.model';

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
    productName: '', hsCode: '', category: '',
    taxType: '', taxStructureId: 0, taxRate: 0,
    unit: '', description: '', status: 'Active'
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

  constructor(private router: Router) {}

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; return; }
    this.isLoading = true; this.errorMsg = ''; this.successMsg = '';
    setTimeout(() => {
      this.isLoading = false;
      this.successMsg = 'Product added successfully!';
      setTimeout(() => this.router.navigate(['/taxable-products']), 1500);
    }, 800);
  }

  onReset(): void {
    this.form = { productName: '', hsCode: '', category: '', taxType: '', taxStructureId: 0, taxRate: 0, unit: '', description: '', status: 'Active' };
    this.errorMsg = ''; this.successMsg = '';
  }

  onCancel(): void { this.router.navigate(['/taxable-products']); }
}