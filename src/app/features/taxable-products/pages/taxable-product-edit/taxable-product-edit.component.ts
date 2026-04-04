import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { TaxableProduct } from 'src/app/models/taxable-product.model';


@Component({
  selector: 'app-taxable-product-edit',
  templateUrl: './taxable-product-edit.component.html',
  styleUrls: ['./taxable-product-edit.component.css']
})
export class TaxableProductEditComponent implements OnInit {

  isLoading  = true;
  isSaving   = false;
  successMsg = '';
  errorMsg   = '';
  productId  = 0;

  categories = ['Electronics', 'Textile', 'Food & Beverage', 'Pharmaceutical', 'Machinery', 'Chemicals', 'Vehicles', 'Agriculture', 'Luxury', 'Other'];
  units      = ['Piece', 'KG', 'Meter', 'Liter', 'Pack', 'Unit', 'Ton', 'Set', 'Box', 'Dozen'];
  statuses   = ['Active', 'Inactive', 'Restricted'];

  taxStructures = [
    { id: 1, name: 'Standard VAT (15%)', type: 'VAT', rate: 15 },
    { id: 2, name: 'Reduced VAT (5%)', type: 'VAT', rate: 5 },
    { id: 4, name: 'AIT on Import (5%)', type: 'AIT', rate: 5 },
    { id: 5, name: 'General Import Duty (25%)', type: 'Import Duty', rate: 25 },
    { id: 6, name: 'Electronics Import Duty (10%)', type: 'Import Duty', rate: 10 },
    { id: 7, name: 'Supplementary Duty (20%)', type: 'Supplementary Duty', rate: 20 },
  ];

  form: any = {};

  onTaxStructureChange(): void {
    const s = this.taxStructures.find(t => t.id === Number(this.form.taxStructureId));
    if (s) { this.form.taxType = s.type; this.form.taxRate = s.rate; }
  }

  constructor(private route: ActivatedRoute, private router: Router,private http: HttpClient  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTaxableProduct();
  }

  loadTaxableProduct(): void {
    this.isLoading = true;

    this.http.get<TaxableProduct>(API_ENDPOINTS.TAXABLE_PRODUCTS.GET(this.productId)).subscribe({
      next: (data) => {
        this.form = { ...data };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load failed:', err);
        this.errorMsg = 'Failed to load taxable product.';
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.form.productName && this.form.hsCode &&
              this.form.category && this.form.unit);
  }

  onSubmit(): void {
    if (!this.isFormValid()) { this.errorMsg = 'Please fill in all required fields.'; 
      return; 
    }
    this.isSaving = true;
    this.errorMsg = '';

    this.http.put(`/api/taxable-products/${this.productId}`, this.form).subscribe({
      next: () => {
        alert('Updated successfully');
        this.isSaving = false;
        this.successMsg = 'Taxable product updated successfully!';
        setTimeout(() => this.router.navigate(['/taxable-products/view', this.productId]), 1500);
      },
      error: (err) => {
        console.error('Update failed', err);
        this.isSaving = false;
        this.errorMsg = 'Failed to update taxable product.';
      }
    });
  }
 
  onCancel(): void { this.router.navigate(['/taxable-products/view', this.productId]); }
}