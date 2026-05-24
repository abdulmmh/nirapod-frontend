import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import { TaxableProductCreateRequest } from 'src/app/models/taxable-product.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TaxableProductService } from '../../services/taxable-product.service';

@Component({
  selector: 'app-taxable-product-edit',
  templateUrl: './taxable-product-edit.component.html',
  styleUrls: ['./taxable-product-edit.component.css'],
})
export class TaxableProductEditComponent implements OnInit, OnDestroy {

  productForm!: FormGroup;

  // ── Dropdown Data ────────────────────────────────────────────────────────
  categories: string[] = [];
  units: string[] = [];
  taxStructures: TaxStructure[] = [];

  // ── Tax Rate Preview ─────────────────────────────────────────────────────
  taxRatePreview: number | null = null;
  taxTypePreview: string = '';

  // ── State ────────────────────────────────────────────────────────────────
  initialising = true;
  loading = false;
  private productId!: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private productService: TaxableProductService,
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadDropdownsThenProduct();
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

  get f() { return this.productForm.controls; }

  // ── Data Loading ─────────────────────────────────────────────────────────

  private loadDropdownsThenProduct(): void {
    forkJoin({
      categories:    this.productService.listCategories(),
      units:         this.productService.listUnits(),
      taxStructures: this.productService.listTaxStructures(),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ categories, units, taxStructures }) => {
        this.categories    = categories;
        this.units         = units;
        this.taxStructures = taxStructures;
        this.loadProduct();
      },
      error: () => {
        this.initialising = false;
        this.toast.error('Failed to load dropdown data.');
      },
    });
  }

  private loadProduct(): void {
    this.productService.getById(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.productForm.patchValue({
            productName:    product.productName,
            hsCode:         product.hsCode,
            category:       product.category,
            unit:           product.unit,
            taxStructureId: product.taxStructureId,
            description:    product.description,
            status:         product.status,
          });
          this.refreshTaxPreview(product.taxStructureId);
          this.initialising = false;
        },
        error: () => {
          this.initialising = false;
          this.toast.error('Failed to load product data.');
        },
      });
  }

  // ── Tax Rate Preview ─────────────────────────────────────────────────────

  onTaxStructureChange(taxStructureId: number): void {
    this.refreshTaxPreview(Number(taxStructureId));
  }

  private refreshTaxPreview(taxStructureId: number | null | undefined): void {
    const ts = this.taxStructures.find(t => t.id == taxStructureId);
    if (ts) {
      this.taxRatePreview = ts.rate;
      this.taxTypePreview = ts.taxType;
    } else {
      this.taxRatePreview = null;
      this.taxTypePreview = '';
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.loading = true;
    const request: TaxableProductCreateRequest = this.productForm.value;

    this.productService.update(this.productId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.toast.success('Product updated successfully.');
          this.router.navigate(['/taxable-products', this.productId]);
        },
        error: (err) => {
          this.loading = false;
          if (err?.status === 409) {
            this.toast.error('A product with this HS code already exists.');
          } else {
            this.toast.error('Failed to update product. Please try again.');
          }
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/taxable-products', this.productId]);
  }
}
