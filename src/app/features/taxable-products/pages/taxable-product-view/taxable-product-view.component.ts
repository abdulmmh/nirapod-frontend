import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxableProduct } from '../../../../models/taxable-product.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-taxable-product-view',
  templateUrl: './taxable-product-view.component.html',
  styleUrls: ['./taxable-product-view.component.css']
})
export class TaxableProductViewComponent implements OnInit {

  product: TaxableProduct | null = null;
  isLoading = true;

  private fallback: TaxableProduct[] = [
    { id: 1, productCode: 'PRD-001', productName: 'Mobile Phone', hsCode: '8517.12.00', category: 'Electronics', taxType: 'VAT', taxStructureId: 1, taxRate: 15, unit: 'Piece', description: 'Mobile phones and smartphones', status: 'Active', createdAt: '2024-01-01' },
    { id: 2, productCode: 'PRD-002', productName: 'Woven Fabric', hsCode: '5208.11.10', category: 'Textile', taxType: 'VAT', taxStructureId: 2, taxRate: 5, unit: 'Meter', description: 'Cotton woven fabrics', status: 'Active', createdAt: '2024-01-01' },
    { id: 3, productCode: 'PRD-003', productName: 'Passenger Car', hsCode: '8703.23.10', category: 'Vehicles', taxType: 'Import Duty', taxStructureId: 5, taxRate: 25, unit: 'Unit', description: 'Passenger automobiles up to 1800cc', status: 'Active', createdAt: '2024-01-01' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
     this.http.get<TaxableProduct>(API_ENDPOINTS.TAXABLE_PRODUCTS.GET(id)).subscribe({
              next: data => { this.product = data; this.isLoading = false; },
              error: ()  => {
                this.product = this.fallback.find(p => p.id === id) || this.fallback[0];
                this.isLoading = false;
              }
            });
  }

  getStatusClass(s: string): string {
    return s === 'Active' ? 'status-active' : s === 'Restricted' ? 'status-suspended' : 'status-inactive';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Electronics': 'bi bi-phone-fill', 'Textile': 'bi bi-scissors',
      'Food & Beverage': 'bi bi-cup-hot-fill', 'Pharmaceutical': 'bi bi-capsule-pill',
      'Machinery': 'bi bi-gear-fill', 'Chemicals': 'bi bi-droplet-fill',
      'Vehicles': 'bi bi-truck-front-fill', 'Agriculture': 'bi bi-tree-fill',
      'Luxury': 'bi bi-gem', 'Other': 'bi bi-box-seam-fill'
    };
    return map[c] ?? 'bi bi-box-seam-fill';
  }

  onEdit(): void { this.router.navigate(['/taxable-products/edit', this.product?.id]); }
  onBack(): void { this.router.navigate(['/taxable-products']); }
}