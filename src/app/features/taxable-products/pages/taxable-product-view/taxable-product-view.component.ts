import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import {
  TaxableProductService,
  TaxableProductViewModel,
} from '../../services/taxable-product.service';

@Component({
  selector: 'app-taxable-product-view',
  templateUrl: './taxable-product-view.component.html',
  styleUrls: ['./taxable-product-view.component.css'],
})
export class TaxableProductViewComponent implements OnInit {
  product: TaxableProductViewModel | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: TaxableProductService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      product: this.productService.get(id),
      taxStructures: this.productService.listTaxStructures(),
    }).subscribe({
      next: ({ product, taxStructures }) => {
        this.product = this.productService.enrichProduct(
          product,
          taxStructures,
        );
        this.isLoading = false;
      },
      error: () => {
        this.product = null;
        this.isLoading = false;
        this.toast.error('Failed to load taxable product details.');
      },
    });
  }

  getStatusClass(s: string): string {
    return s === 'Active'
      ? 'status-active'
      : s === 'Restricted'
        ? 'status-suspended'
        : 'status-inactive';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      Electronics: 'bi bi-phone-fill',
      Textile: 'bi bi-scissors',
      'Food & Beverage': 'bi bi-cup-hot-fill',
      Pharmaceutical: 'bi bi-capsule-pill',
      Machinery: 'bi bi-gear-fill',
      Chemicals: 'bi bi-droplet-fill',
      Vehicles: 'bi bi-truck-front-fill',
      Agriculture: 'bi bi-tree-fill',
      Luxury: 'bi bi-gem',
      Other: 'bi bi-box-seam-fill',
    };
    return map[c] ?? 'bi bi-box-seam-fill';
  }

  onEdit(): void {
    if (!this.product) return;
    this.router.navigate(['/taxable-products/edit', this.product.id]);
  }

  onBack(): void {
    this.router.navigate(['/taxable-products']);
  }
}
