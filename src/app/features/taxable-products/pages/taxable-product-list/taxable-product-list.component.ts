import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';
import {
  TaxableProductService,
  TaxableProductViewModel,
} from '../../services/taxable-product.service';

@Component({
  selector: 'app-taxable-product-list',
  templateUrl: './taxable-product-list.component.html',
  styleUrls: ['./taxable-product-list.component.css'],
})
export class TaxableProductListComponent implements OnInit {
  products: TaxableProductViewModel[] = [];
  searchTerm = '';
  isLoading = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  constructor(
    private router: Router,
    private productService: TaxableProductService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    forkJoin({
      products: this.productService.list(),
      taxStructures: this.productService.listTaxStructures(),
    }).subscribe({
      next: ({ products, taxStructures }) => {
        this.products = this.productService.enrichProducts(
          products,
          taxStructures,
        );
        this.isLoading = false;
      },
      error: () => {
        this.products = [];
        this.isLoading = false;
        this.toast.error(
          'Failed to load taxable products. Please refresh the page.',
        );
      },
    });
  }

  get filtered(): TaxableProductViewModel[] {
    if (!this.searchTerm.trim()) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(
      (p) =>
        p.productName.toLowerCase().includes(term) ||
        p.hsCode.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.taxType.toLowerCase().includes(term),
    );
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

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.resetDeleteState();
    this.delete(id);
  }

  private delete(id: number): void {
    this.productService.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
        this.toast.success('Taxable product deleted successfully.');
      },
      error: () => {
        this.toast.error('Failed to delete taxable product. Please try again.');
      },
    });
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  exportProducts(): void {
    this.toast.success('Taxable product data exported successfully!');
  }

  view(id: number): void {
    this.router.navigate(['/taxable-products/view', id]);
  }
  edit(id: number): void {
    this.router.navigate(['/taxable-products/edit', id]);
  }
}
