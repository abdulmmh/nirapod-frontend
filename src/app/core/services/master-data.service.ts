import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BusinessCategory, BusinessType, TaxpayerType } from 'src/app/models/master-data.model';
import { District, Division } from 'src/app/models/master-data.model';


@Injectable({ providedIn: 'root' })
export class MasterDataService extends BaseApiService {

  getDivisions(): Observable<Division[]> {
    return this.get<Division[]>(API_ENDPOINTS.MASTER_DATA.DIVISIONS).pipe(
      catchError(() => of([]))
    );
  }

  getDistrictsByDivision(divisionId: number): Observable<District[]> {
    return this.get<District[]>(
      API_ENDPOINTS.MASTER_DATA.DISTRICTS_BY_DIVISION(divisionId)
    ).pipe(catchError(() => of([])));
  }

  getTaxpayerTypes(): Observable<TaxpayerType[]> {
    return this.get<TaxpayerType[]>(
      API_ENDPOINTS.MASTER_DATA.TAXPAYER_TYPES
    ).pipe(catchError(() => of([])));
  }

  getActiveTaxpayers(): Observable<any[]> {
    return this.get<any[]>(`${API_ENDPOINTS.TAXPAYERS.LIST}?status=Active`).pipe(
      catchError(() => of([]))
    );
  }

  getBusinessTypes(): Observable<BusinessType[]> {
    return this.get<BusinessType[]>(API_ENDPOINTS.MASTER_DATA.BUSINESS_TYPES).pipe(
      catchError(() => of([]))
    );
  }

  getBusinessCategories(): Observable<BusinessCategory[]> {
    return this.get<BusinessCategory[]>(API_ENDPOINTS.MASTER_DATA.BUSINESS_CATEGORIES).pipe(
      catchError(() => of([]))
    );
  }
}