import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import {
  ProductStatus,
  TaxableProductCreateRequest,
} from 'src/app/models/taxable-product.model';
import { TaxableProductService } from '../../services/taxable-product.service';

@Component({
  selector: 'app-taxable-product-edit',
  templateUrl: './taxable-product-edit.component.html',
  styleUrls: ['./taxable-product-edit.component.css'],
})
export class TaxableProductEditComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  productId = 0;
  productCode = '';

  categories: string[] = [];
  units: string[] = [];
  statuses: ProductStatus[] = ['Active', 'Inactive', 'Restricted'];
  taxStructures: TaxStructure[] = [];

  form: TaxableProductCreateRequest = {
    productName: '',
    hsCode: '',
    category: '',
    taxStructureId: 0,
    unit: '',
    description: '',
    status: 'Active',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: TaxableProductService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPageData();
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

  loadPageData(): void {
    this.isLoading = true;
    forkJoin({
      product: this.productService.get(this.productId),
      categories: this.productService.listCategories(),
      units: this.productService.listUnits(),
      taxStructures: this.productService.listTaxStructures(),
    }).subscribe({
      next: ({ product, categories, units, taxStructures }) => {
        this.categories = categories;
        this.units = units;
        this.taxStructures = taxStructures;
        this.productCode = product.productCode;
        this.form = {
          productName: product.productName,
          hsCode: product.hsCode,
          category: product.category,
          taxStructureId: product.taxStructureId,
          unit: product.unit,
          description: product.description,
          status: product.status,
        };
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load taxable product data.';
        this.toast.error(this.errorMsg);
        this.isLoading = false;
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
      return;
    }

    this.isSaving = true;
    this.errorMsg = '';

    this.productService.update(this.productId, this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMsg = 'Taxable product updated successfully!';
        this.toast.success(this.successMsg);
        setTimeout(
          () =>
            this.router.navigate(['/taxable-products/view', this.productId]),
          1500,
        );
      },
      error: () => {
        this.isSaving = false;
        this.errorMsg = 'Failed to update taxable product.';
        this.toast.error(this.errorMsg);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/taxable-products/view', this.productId]);
  }
}
