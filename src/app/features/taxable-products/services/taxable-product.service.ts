import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { BaseApiService } from 'src/app/core/services/base-api.service';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import {
  TaxableProduct,
  TaxableProductCreateRequest,
  TaxableProductViewModel,
} from 'src/app/models/taxable-product.model';

@Injectable({ providedIn: 'root' })
export class TaxableProductService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  list(): Observable<TaxableProduct[]> {
    return this.get<TaxableProduct[]>(API_ENDPOINTS.TAXABLE_PRODUCTS.LIST);
  }

  getById(id: number): Observable<TaxableProduct> {
    return this.get<TaxableProduct>(`${API_ENDPOINTS.TAXABLE_PRODUCTS.LIST}/${id}`);
  }

  create(request: TaxableProductCreateRequest): Observable<void> {
    return this.post<void>(API_ENDPOINTS.TAXABLE_PRODUCTS.CREATE, request);
  }

  update(id: number, request: TaxableProductCreateRequest): Observable<void> {
    return this.put<void>(`${API_ENDPOINTS.TAXABLE_PRODUCTS.LIST}/${id}`, request);
  }

  deleteProduct(id: number): Observable<void> {
    return this.delete<void>(`${API_ENDPOINTS.TAXABLE_PRODUCTS.LIST}/${id}`);
  }

  // ── Master Data ───────────────────────────────────────────────────────────

  listCategories(): Observable<string[]> {
    return this.get<string[]>(API_ENDPOINTS.TAXABLE_PRODUCTS.CATEGORIES);
  }

  listUnits(): Observable<string[]> {
    return this.get<string[]>(API_ENDPOINTS.TAXABLE_PRODUCTS.UNITS);
  }

  listTaxStructures(): Observable<TaxStructure[]> {
    return this.get<TaxStructure[]>(API_ENDPOINTS.TAX_STRUCTURES.LIST);
  }

  // ── View Model Enrichment ─────────────────────────────────────────────────

  enrichProduct(product: TaxableProduct, taxStructures: TaxStructure[]): TaxableProductViewModel {
    const ts = taxStructures.find(t => t.id === product.taxStructureId);
    return {
      ...product,
      taxType: ts?.taxType ?? product.taxType ?? 'VAT',
      taxRate: ts?.rate    ?? product.taxRate  ?? 0,
    };
  }

  enrichProducts(products: TaxableProduct[], taxStructures: TaxStructure[]): TaxableProductViewModel[] {
    return products.map(p => this.enrichProduct(p, taxStructures));
  }
}
