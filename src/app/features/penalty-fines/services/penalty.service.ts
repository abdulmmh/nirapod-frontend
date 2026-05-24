import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Penalty, PenaltyCreateRequest, PenaltyStatusRequest } from '../../../models/penalty.model';

@Injectable({ providedIn: 'root' })
export class PenaltyService {
  constructor(private http: HttpClient) {}

  getAll(search?: string, status?: string): Observable<Penalty[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
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

  submit(id: number, req: PenaltyStatusRequest): Observable<Penalty> {
    return this.http.post<Penalty>(API_ENDPOINTS.PENALTIES.SUBMIT(id), req);
  }

  approve(id: number, req: PenaltyStatusRequest): Observable<Penalty> {
    return this.http.post<Penalty>(API_ENDPOINTS.PENALTIES.APPROVE(id), req);
  }

  reject(id: number, req: PenaltyStatusRequest): Observable<Penalty> {
    return this.http.post<Penalty>(API_ENDPOINTS.PENALTIES.REJECT(id), req);
  }

  issue(id: number, req: PenaltyStatusRequest): Observable<Penalty> {
    return this.http.post<Penalty>(API_ENDPOINTS.PENALTIES.ISSUE(id), req);
  }

  cancel(id: number, req: PenaltyStatusRequest): Observable<Penalty> {
    return this.http.post<Penalty>(API_ENDPOINTS.PENALTIES.CANCEL(id), req);
  }
}