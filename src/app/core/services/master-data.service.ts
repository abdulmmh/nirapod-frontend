import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService extends BaseApiService {
  
  getDivisions(): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.MASTER_DATA.DIVISIONS);
  }

  getDistrictsByDivision(divisionId: number): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.MASTER_DATA.DISTRICTS_BY_DIVISION(divisionId));
  }

  getTaxpayerTypes(): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.MASTER_DATA.TAXPAYER_TYPES);
  }

  getActiveTaxpayers(): Observable<any[]> {
    return this.get<any[]>(API_ENDPOINTS.TAXPAYERS.LIST);
  }
}