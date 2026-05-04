import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { TaxStructure } from 'src/app/models/tax-structure.model';
import { TaxableProduct, TaxableProductCreateRequest } from 'src/app/models/taxable-product.model';

export interface TaxableProductViewModel extends TaxableProduct {
  taxType: string;
  taxRate: number;
}

@Injectable({ providedIn: 'root' })
export class TaxableProductService {

  constructor(private http: HttpClient) {}

  list(): Observable<TaxableProduct[]> {
    return this.http.get<TaxableProduct[]>(API_ENDPOINTS.TAXABLE_PRODUCTS.LIST);
  }

  get(id: number): Observable<TaxableProduct> {
    return this.http.get<TaxableProduct>(API_ENDPOINTS.TAXABLE_PRODUCTS.GET(id));
  }

  create(request: TaxableProductCreateRequest): Observable<TaxableProduct> {
    return this.http.post<TaxableProduct>(API_ENDPOINTS.TAXABLE_PRODUCTS.CREATE, request);
  }

  update(id: number, request: TaxableProductCreateRequest): Observable<TaxableProduct> {
    return this.http.put<TaxableProduct>(API_ENDPOINTS.TAXABLE_PRODUCTS.UPDATE(id), request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TAXABLE_PRODUCTS.DELETE(id));
  }

  listCategories(): Observable<string[]> {
    return this.http.get<string[]>(API_ENDPOINTS.TAXABLE_PRODUCTS.CATEGORIES);
  }

  listUnits(): Observable<string[]> {
    return this.http.get<string[]>(API_ENDPOINTS.TAXABLE_PRODUCTS.UNITS);
  }

  listTaxStructures(): Observable<TaxStructure[]> {
    return this.http.get<TaxStructure[]>(API_ENDPOINTS.TAX_STRUCTURES.LIST)
      .pipe(map(items => items.filter(item => item.status === 'Active')));
  }

  enrichProduct(product: TaxableProduct, taxStructures: TaxStructure[]): TaxableProductViewModel {
    const structure = taxStructures.find(item => item.id === Number(product.taxStructureId));
    return {
      ...product,
      taxType: structure?.taxType ?? product.taxType ?? 'N/A',
      taxRate: structure?.rate ?? product.taxRate ?? 0,
    };
  }

  enrichProducts(products: TaxableProduct[], taxStructures: TaxStructure[]): TaxableProductViewModel[] {
    return products.map(product => this.enrichProduct(product, taxStructures));
  }
}
