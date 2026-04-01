import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Taxpayer, TaxpayerCreateRequest } from 'src/app/models/taxpayer.model';

@Injectable({
  providedIn: 'root'
})
export class TaxpayerService {
  constructor(private http: HttpClient) {}

  getAllTaxpayers(): Observable<Taxpayer[]> {
    return this.http.get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST);
  }

  getTaxpayerById(id: number): Observable<Taxpayer> {
    return this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(id));
  }

  createTaxpayer(payload: TaxpayerCreateRequest): Observable<Taxpayer> {
    return this.http.post<Taxpayer>(API_ENDPOINTS.TAXPAYERS.CREATE, payload);
  }

  updateTaxpayer(id: number, payload: TaxpayerCreateRequest): Observable<Taxpayer> {
    return this.http.put<Taxpayer>(API_ENDPOINTS.TAXPAYERS.UPDATE(id), payload);
  }

  deleteTaxpayer(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TAXPAYERS.DELETE(id));
  }
}