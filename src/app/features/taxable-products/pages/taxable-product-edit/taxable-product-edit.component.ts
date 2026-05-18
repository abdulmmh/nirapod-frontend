
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import { TaxableProductCreateRequest } from 'src/app/models/taxable-product.model';

import { TaxableProductService } from '../../services/taxable-product.service';


@Component({
  selector: 'app-taxable-product-edit',
  templateUrl: './taxable-product-edit.component.html',
  styleUrls: ['./taxable-product-edit.component.css']
})
export class TaxableProductEditComponent implements OnInit {

  productId!: number;

  // ── Dropdown data (loaded dynamically) ───────────────────────────────────
  categories:    string[]       = [];
  units:         string[]       = [];
  taxStructures: TaxStructure[] = [];

  // ── Form model ────────────────────────────────────────────────────────────
  request: TaxableProductCreateRequest = {
    productName:    '',
    hsCode:         '',
    category:       '',
    taxStructureId: 0,
    unit:           '',
    description:    '',
    status:         'Active'
  };

  taxRatePreview: number | null = null;
  taxTypePreview: string        = '';

  errorMessage = '';
  loading      = false;
  initialising = true;


  constructor(
    private productService: TaxableProductService,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.loadDropdownsThenProduct();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  private loadDropdownsThenProduct(): void {
    let categoriesDone    = false;
    let unitsDone         = false;
    let taxStructuresDone = false;

    const tryLoadProduct = () => {
      if (categoriesDone && unitsDone && taxStructuresDone) {
        this.loadProduct();
      }
    };

    this.productService.listCategories().subscribe({
      next:  data => { this.categories = data;    categoriesDone    = true; tryLoadProduct(); },
      error: ()   => { categoriesDone = true; tryLoadProduct(); }
    });

    this.productService.listUnits().subscribe({
      next:  data => { this.units = data;          unitsDone         = true; tryLoadProduct(); },
      error: ()   => { unitsDone = true; tryLoadProduct(); }
    });

    this.productService.listTaxStructures().subscribe({
      next:  data => { this.taxStructures = data;  taxStructuresDone = true; tryLoadProduct(); },
      error: ()   => { taxStructuresDone = true; tryLoadProduct(); }
    });
  }

  private loadProduct(): void {
    this.productService.get(this.productId).subscribe({
      next: product => {
        this.request = {
          productName:    product.productName,
          hsCode:         product.hsCode,
          category:       product.category,
          taxStructureId: product.taxStructureId ?? 0,
          unit:           product.unit,
          description:    product.description,
          status:         product.status
        };
        this.refreshTaxPreview(product.taxStructureId);
        this.initialising = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load product data.';
        this.initialising = false;
      }
    });
  }

  // ── Tax rate preview ──────────────────────────────────────────────────────

  onTaxStructureChange(taxStructureId: number): void {
    this.refreshTaxPreview(+taxStructureId);
  }

  private refreshTaxPreview(taxStructureId: number | null | undefined): void {
    const selected = this.taxStructures.find(ts => ts.id === taxStructureId);
    if (selected) {
      this.taxRatePreview = selected.rate;
      this.taxTypePreview = selected.taxType;
    } else {
      this.taxRatePreview = null;
      this.taxTypePreview = '';
    }
  }

  // ── Form submission ───────────────────────────────────────────────────────

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.productService.update(this.productId, this.request).subscribe({
      next:  ()  => this.route.navigate(['/taxable-products']),
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Failed to update product.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.route.navigate(['/taxable-products']);
  }
}
