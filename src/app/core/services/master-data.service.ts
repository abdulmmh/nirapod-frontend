import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class MasterDataService extends BaseApiService {


  getDivisions(): Observable<any[]> {
    return this.get<any[]>('master/divisions');
  }

  getDistrictsByDivision(divisionId: number): Observable<any[]> {
    return this.get<any[]>(`master/districts/${divisionId}`);
  }

  getTaxpayerTypes(): Observable<any[]> {
    return this.get<any[]>('master/taxpayer-types');
  }
}