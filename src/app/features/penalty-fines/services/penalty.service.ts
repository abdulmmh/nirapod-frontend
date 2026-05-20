import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Penalty, PenaltyCreateRequest, PenaltyListResponse } from '../../../models/penalty.model';

@Injectable({ providedIn: 'root' })
export class PenaltyService {
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<Penalty[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Penalty[]>(API_ENDPOINTS.PENALTIES.LIST, { params });
  }

  getById(id: number): Observable<Penalty> {
    return this.http.get<Penalty>(API_ENDPOINTS.PENALTIES.GET(id));
  }

  create(req: PenaltyCreateRequest): Observable<Penalty> {
    return this.http.post<Penalty>(API_ENDPOINTS.PENALTIES.CREATE, req);
  }

  update(id: number, req: Partial<PenaltyCreateRequest>): Observable<Penalty> {
    return this.http.put<Penalty>(API_ENDPOINTS.PENALTIES.UPDATE(id), req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.PENALTIES.DELETE(id));
  }
}