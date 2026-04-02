import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaxableProduct } from '../../../../models/taxable-product.model';

@Component({
  selector: 'app-taxable-product-list',
  templateUrl: './taxable-product-list.component.html',
  styleUrls: ['./taxable-product-list.component.css']
})
export class TaxableProductListComponent implements OnInit {

  products: TaxableProduct[] = [];
  searchTerm = '';
  isLoading  = false;

  private fallback: TaxableProduct[] = [
    { id: 1, productCode: 'PRD-001', productName: 'Mobile Phone', hsCode: '8517.12.00', category: 'Electronics', taxType: 'VAT', taxStructureId: 1, taxRate: 15, unit: 'Piece', description: 'Mobile phones and smartphones', status: 'Active', createdAt: '2024-01-01' },
    { id: 2, productCode: 'PRD-002', productName: 'Woven Fabric', hsCode: '5208.11.10', category: 'Textile', taxType: 'VAT', taxStructureId: 2, taxRate: 5, unit: 'Meter', description: 'Cotton woven fabrics', status: 'Active', createdAt: '2024-01-01' },
    { id: 3, productCode: 'PRD-003', productName: 'Passenger Car', hsCode: '8703.23.10', category: 'Vehicles', taxType: 'Import Duty', taxStructureId: 5, taxRate: 25, unit: 'Unit', description: 'Passenger automobiles up to 1800cc', status: 'Active', createdAt: '2024-01-01' },
    { id: 4, productCode: 'PRD-004', productName: 'Pharmaceutical Drug', hsCode: '3004.90.99', category: 'Pharmaceutical', taxType: 'VAT', taxStructureId: 1, taxRate: 0, unit: 'Pack', description: 'Essential medicines - zero rated', status: 'Active', createdAt: '2024-01-01' },
    { id: 5, productCode: 'PRD-005', productName: 'Cigarettes', hsCode: '2402.20.10', category: 'Other', taxType: 'Supplementary Duty', taxStructureId: 7, taxRate: 65, unit: 'Pack', description: 'Cigarettes and tobacco products', status: 'Active', createdAt: '2024-01-01' },
    { id: 6, productCode: 'PRD-006', productName: 'Industrial Machinery', hsCode: '8428.90.00', category: 'Machinery', taxType: 'Import Duty', taxStructureId: 5, taxRate: 5, unit: 'Unit', description: 'Industrial machinery for manufacturing', status: 'Active', createdAt: '2024-01-01' },
    { id: 7, productCode: 'PRD-007', productName: 'Perfume', hsCode: '3303.00.00', category: 'Luxury', taxType: 'Supplementary Duty', taxStructureId: 7, taxRate: 20, unit: 'Bottle', description: 'Perfumes and toilet waters', status: 'Active', createdAt: '2024-01-01' },
    { id: 8, productCode: 'PRD-008', productName: 'Rice', hsCode: '1006.30.00', category: 'Food & Beverage', taxType: 'VAT', taxStructureId: 2, taxRate: 0, unit: 'KG', description: 'Milled rice - zero rated essential food', status: 'Active', createdAt: '2024-01-01' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => { this.products = this.fallback; this.isLoading = false; }, 400);
  }

  get filtered(): TaxableProduct[] {
    if (!this.searchTerm.trim()) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p =>
      p.productName.toLowerCase().includes(term) ||
      p.hsCode.toLowerCase().includes(term)      ||
      p.category.toLowerCase().includes(term)    ||
      p.taxType.toLowerCase().includes(term)
    );
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

  delete(id: number): void {
    if (!confirm('Delete this product?')) return;
    this.products = this.products.filter(p => p.id !== id);
  }
  view(id: number): void { this.router.navigate(['/taxable-products/view', id]); }
  edit(id: number): void { this.router.navigate(['/taxable-products/edit', id]); }
}