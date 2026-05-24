import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import { ProductStatus } from '../../../../models/taxable-product.model';
import { TaxableProductService } from '../../services/taxable-product.service';

@Component({
  selector: 'app-taxable-product-create',
  templateUrl: './taxable-product-create.component.html',
  styleUrls: ['./taxable-product-create.component.css'],
})
export class TaxableProductCreateComponent implements OnInit, OnDestroy {

  productForm!: FormGroup;

  // ── Dropdown Data ────────────────────────────────────────────────────────
  categories: string[] = [];
  units: string[] = [];
  taxStructures: TaxStructure[] = [];
  statuses: ProductStatus[] = ['Active', 'Inactive', 'Restricted'];

  // ── State ────────────────────────────────────────────────────────────────
  isMasterDataLoading = false;
  isLoading = false;
  selectedTaxStructure: TaxStructure | undefined;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastService,
    private productService: TaxableProductService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMasterData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  private initForm(): void {
    this.productForm = this.fb.group({
      productName:    ['', Validators.required],
      hsCode:         ['', Validators.required],
      category:       ['', Validators.required],
      unit:           ['', Validators.required],
      taxStructureId: [null, Validators.required],
      description:    [''],
      status:         ['Active', Validators.required],
    });
  }

  /** Shorthand for template access */
  get f() { return this.productForm.controls; }

  // ── Tax Rate Preview ─────────────────────────────────────────────────────

  get selectedTaxType(): string {
    return this.selectedTaxStructure?.taxType ?? '';
  }

  get selectedTaxRate(): number {
    return this.selectedTaxStructure?.rate ?? 0;
  }

  onTaxStructureChange(): void {
    const id = this.productForm.value.taxStructureId;
    this.selectedTaxStructure = this.taxStructures.find(ts => ts.id == id);
  }

  // ── Data Loading ─────────────────────────────────────────────────────────

  loadMasterData(): void {
    this.isMasterDataLoading = true;
    forkJoin({
      categories:     this.productService.listCategories(),
      units:          this.productService.listUnits(),
      taxStructures:  this.productService.listTaxStructures(),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ categories, units, taxStructures }) => {
        this.categories    = categories;
        this.units         = units;
        this.taxStructures = taxStructures;
        this.isMasterDataLoading = false;
      },
      error: () => {
        this.isMasterDataLoading = false;
        this.toast.error('Failed to load product master data. Please refresh.');
      },
    });
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    this.productService.create(this.productForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toast.success('Product saved successfully.');
          this.router.navigate(['/taxable-products']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err?.status === 409) {
            this.toast.error('A product with this HS code already exists.');
          } else {
            this.toast.error('Failed to save product. Please try again.');
          }
        },
      });
  }

  onReset(): void {
    this.productForm.reset({ status: 'Active' });
    this.selectedTaxStructure = undefined;
  }

  onCancel(): void {
    this.router.navigate(['/taxable-products']);
  }
}
