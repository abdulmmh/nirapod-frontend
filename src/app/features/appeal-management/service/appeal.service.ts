import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appeal, AppealCreateRequest, AppealDecisionRequest, AppealHearingRequest } from '../model/appeal.model';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';

@Injectable({ providedIn: 'root' })
export class AppealService {

  constructor(private http: HttpClient) {}

  // ── Officer ───────────────────────────────────────────────────────────────
  getAll(): Observable<Appeal[]> {
    return this.http.get<Appeal[]>(API_ENDPOINTS.APPEALS.LIST);
  }

  getById(id: number): Observable<Appeal> {
    return this.http.get<Appeal>(API_ENDPOINTS.APPEALS.GET(id));
  }

  search(q: string): Observable<Appeal[]> {
    return this.http.get<Appeal[]>(API_ENDPOINTS.APPEALS.SEARCH, { params: { q } });
  }

  getKpis(): Observable<{ [key: string]: number }> {
    return this.http.get<any>(API_ENDPOINTS.APPEALS.KPIS);
  }

  getByAuditCase(auditCaseId: number): Observable<Appeal[]> {
    return this.http.get<Appeal[]>(API_ENDPOINTS.APPEALS.BY_CASE(auditCaseId));
  }

  takeUnderReview(id: number, assignedTo?: string): Observable<Appeal> {
    return this.http.post<Appeal>(API_ENDPOINTS.APPEALS.REVIEW(id), { assignedTo });
  }

  scheduleHearing(id: number, req: AppealHearingRequest): Observable<Appeal> {
    return this.http.post<Appeal>(API_ENDPOINTS.APPEALS.SCHEDULE_HEARING(id), req);
  }

  decide(id: number, req: AppealDecisionRequest): Observable<Appeal> {
    return this.http.post<Appeal>(API_ENDPOINTS.APPEALS.DECIDE(id), req);
  }

  close(id: number, reason?: string): Observable<Appeal> {
    return this.http.post<Appeal>(API_ENDPOINTS.APPEALS.CLOSE(id), { reason });
  }

  // ── Taxpayer Portal ───────────────────────────────────────────────────────
  getMyAppeals(): Observable<Appeal[]> {
    return this.http.get<Appeal[]>(API_ENDPOINTS.APPEALS.MY_LIST);
  }

  getMyAppealById(id: number): Observable<Appeal> {
    return this.http.get<Appeal>(API_ENDPOINTS.APPEALS.MY_GET(id));
  }

  fileAppeal(req: AppealCreateRequest): Observable<Appeal> {
    return this.http.post<Appeal>(API_ENDPOINTS.APPEALS.MY_FILE, req);
  }

  withdraw(id: number, reason?: string): Observable<Appeal> {
    return this.http.post<Appeal>(API_ENDPOINTS.APPEALS.MY_WITHDRAW(id), { reason });
  }
}
