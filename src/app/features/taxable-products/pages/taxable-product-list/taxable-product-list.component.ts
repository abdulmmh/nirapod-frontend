import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TaxableProductViewModel } from 'src/app/models/taxable-product.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TaxableProductService } from '../../services/taxable-product.service';

@Component({
  selector: 'app-taxable-product-list',
  templateUrl: './taxable-product-list.component.html',
  styleUrls: ['./taxable-product-list.component.css'],
})
export class TaxableProductListComponent implements OnInit {

  products: TaxableProductViewModel[] = [];
  searchTerm = '';
  isLoading = false;

  // Delete modal state
  showDeleteModal = false;
  private deleteTargetId: number | null = null;

  constructor(
    private router: Router,
    private toast: ToastService,
    private productService: TaxableProductService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ── Data ─────────────────────────────────────────────────────────────────

  loadProducts(): void {
    this.isLoading = true;
    forkJoin({
      products:      this.productService.list(),
      taxStructures: this.productService.listTaxStructures(),
    }).subscribe({
      next: ({ products, taxStructures }) => {
        this.products  = this.productService.enrichProducts(products, taxStructures);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.error('Failed to load products.');
      },
    });
  }

  // ── Filtered list ────────────────────────────────────────────────────────

  get filtered(): TaxableProductViewModel[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.products;
    return this.products.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      p.productCode.toLowerCase().includes(q) ||
      p.hsCode.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.taxType.toLowerCase().includes(q)
    );
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  get activeCount():     number { return this.products.filter(p => p.status === 'Active').length; }
  get inactiveCount():   number { return this.products.filter(p => p.status === 'Inactive').length; }
  get restrictedCount(): number { return this.products.filter(p => p.status === 'Restricted').length; }

  // ── Helpers ──────────────────────────────────────────────────────────────

  getStatusClass(s: string): string {
    switch (s) {
      case 'Active':     return 'status-active';
      case 'Inactive':   return 'status-inactive';
      case 'Restricted': return 'status-restricted';
      default:           return 'status-inactive';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Electronics':    return 'bi bi-phone-fill';
      case 'Food':           return 'bi bi-egg-fried';
      case 'Clothing':       return 'bi bi-bag-fill';
      case 'Service':        return 'bi bi-gear-fill';
      case 'Industrial':     return 'bi bi-tools';
      case 'Pharmaceutical': return 'bi bi-capsule';
      case 'Automobile':     return 'bi bi-car-front-fill';
      default:               return 'bi bi-box-seam-fill';
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  view(id: number): void { this.router.navigate(['/taxable-products', id]); }
  edit(id: number): void { this.router.navigate(['/taxable-products', id, 'edit']); }

  // ── Delete ───────────────────────────────────────────────────────────────

  confirmDelete(id: number): void {
    this.deleteTargetId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  confirmDeleteExecute(): void {
    if (this.deleteTargetId === null) return;
    this.delete(this.deleteTargetId);
  }

  private delete(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success('Product deleted successfully.');
        this.resetDeleteState();
        this.loadProducts();
      },
      error: () => {
        this.toast.error('Failed to delete product.');
        this.resetDeleteState();
      },
    });
  }

  private resetDeleteState(): void {
    this.showDeleteModal  = false;
    this.deleteTargetId   = null;
  }

  // ── Export ───────────────────────────────────────────────────────────────

  exportProducts(): void {
    this.toast.info('Export feature coming soon.');
  }
}
