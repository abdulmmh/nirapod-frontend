import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TaxableProductViewModel } from 'src/app/models/taxable-product.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TaxableProductService } from '../../services/taxable-product.service';

@Component({
  selector: 'app-taxable-product-view',
  templateUrl: './taxable-product-view.component.html',
  styleUrls: ['./taxable-product-view.component.css'],
})
export class TaxableProductViewComponent implements OnInit {

  product: TaxableProductViewModel | null = null;
  isLoading = false;
  private productId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private productService: TaxableProductService,
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct();
  }

  private loadProduct(): void {
    this.isLoading = true;
    forkJoin({
      product:       this.productService.getById(this.productId),
      taxStructures: this.productService.listTaxStructures(),
    }).subscribe({
      next: ({ product, taxStructures }) => {
        this.product   = this.productService.enrichProduct(product, taxStructures);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.error('Failed to load product details.');
      },
    });
  }

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

  onEdit(): void {
    this.router.navigate(['/taxable-products', this.productId, 'edit']);
  }

  onBack(): void {
    this.router.navigate(['/taxable-products']);
  }
}