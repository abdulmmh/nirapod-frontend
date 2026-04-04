import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { TaxStructure, TaxStructureCreateRequest } from 'src/app/models/tax-structure.model';

@Injectable({
  providedIn: 'root'
})
export class TaxStructureService {

  constructor(private http: HttpClient) { }

  getAllTaxStructures(): Observable<TaxStructure[]> {
    return this.http.get<TaxStructure[]>(API_ENDPOINTS.TAX_STRUCTURES.LIST);
  }

  getTaxStructureById(id: number): Observable<TaxStructure> {
    return this.http.get<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.GET(id));
  }

  createTaxStructure(payload: TaxStructureCreateRequest): Observable<TaxStructure> {
    return this.http.post<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.CREATE, payload);
  }

  updateTaxStructure(id: number, payload: TaxStructureCreateRequest): Observable<TaxStructure> {
    return this.http.put<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.UPDATE(id), payload);
  }

  deleteTaxStructure(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TAX_STRUCTURES.DELETE(id));
  }
}
