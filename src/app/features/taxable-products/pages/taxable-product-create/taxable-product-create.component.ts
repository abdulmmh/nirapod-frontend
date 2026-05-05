import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import {
  ProductStatus,
  TaxableProductCreateRequest,
} from '../../../../models/taxable-product.model';
import { TaxableProductService } from '../../services/taxable-product.service';

@Component({
  selector: 'app-taxable-product-create',
  templateUrl: './taxable-product-create.component.html',
  styleUrls: ['./taxable-product-create.component.css'],
})
export class TaxableProductCreateComponent implements OnInit {
  isLoading = false;
  isMasterDataLoading = false;
  successMsg = '';
  errorMsg = '';

  categories: string[] = [];
  units: string[] = [];
  statuses: ProductStatus[] = ['Active', 'Inactive', 'Restricted'];
  taxStructures: TaxStructure[] = [];

  form: TaxableProductCreateRequest = this.createEmptyForm();

  constructor(
    private router: Router,
    private productService: TaxableProductService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
  }

  get selectedTaxStructure(): TaxStructure | undefined {
    return this.taxStructures.find(
      (t) => t.id === Number(this.form.taxStructureId),
    );
  }

  get selectedTaxType(): string {
    return this.selectedTaxStructure?.taxType ?? '';
  }

  get selectedTaxRate(): number {
    return this.selectedTaxStructure?.rate ?? 0;
  }

  loadMasterData(): void {
    this.isMasterDataLoading = true;
    forkJoin({
      categories: this.productService.listCategories(),
      units: this.productService.listUnits(),
      taxStructures: this.productService.listTaxStructures(),
    }).subscribe({
      next: ({ categories, units, taxStructures }) => {
        this.categories = categories;
        this.units = units;
        this.taxStructures = taxStructures;
        this.isMasterDataLoading = false;
      },
      error: () => {
        this.isMasterDataLoading = false;
        this.errorMsg =
          'Failed to load product master data. Please refresh the page.';
        this.toast.error(this.errorMsg);
      },
    });
  }

  onTaxStructureChange(): void {}

  isFormValid(): boolean {
    return !!(
      this.form.productName.trim() &&
      this.form.hsCode.trim() &&
      this.form.category &&
      this.form.unit &&
      this.form.taxStructureId > 0
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields.';
      this.toast.error(this.errorMsg);
      this.successMsg = '';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.productService.create(this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMsg = 'Taxable product created successfully!';
        this.toast.success(this.successMsg);
        setTimeout(() => this.router.navigate(['/taxable-products']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg =
          err.status === 400
            ? 'Invalid input. Please check the form.'
            : 'Create failed. Please try again.';
        this.toast.error(this.errorMsg);
      },
    });
  }

  onReset(): void {
    this.form = this.createEmptyForm();
    this.errorMsg = '';
    this.successMsg = '';
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/taxable-products']);
  }

  private createEmptyForm(): TaxableProductCreateRequest {
    return {
      productName: '',
      hsCode: '',
      category: '',
      taxStructureId: 0,
      unit: '',
      description: '',
      status: 'Active',
    };
  }
}