import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api.service';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { TaxableProduct, TaxableProductCreateRequest } from 'src/app/models/taxable-product.model';


@Injectable({
  providedIn: 'root'
})
export class TaxableProductsService extends BaseApiService {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  getTaxableProducts(params?: any): Observable<TaxableProduct[]> {
    return this.get<TaxableProduct[]>(API_ENDPOINTS.TAXABLE_PRODUCTS.LIST, params);
  }

  getTaxableProductById(id: number): Observable<TaxableProduct> {
    return this.get<TaxableProduct>(API_ENDPOINTS.TAXABLE_PRODUCTS.GET(id));
  }

  createTaxableProduct(payload: TaxableProductCreateRequest): Observable<any> {
    return this.post<any>(API_ENDPOINTS.TAXABLE_PRODUCTS.CREATE, payload);
  }

  updateTaxableProduct(id: number, payload: TaxableProductCreateRequest): Observable<any> {
    return this.put<any>(API_ENDPOINTS.TAXABLE_PRODUCTS.UPDATE(id), payload);
  }

  deleteTaxableProduct(id: number): Observable<any> {
    return this.delete<any>(API_ENDPOINTS.TAXABLE_PRODUCTS.DELETE(id));
  }
}