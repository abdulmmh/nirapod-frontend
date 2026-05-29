// ait-credit.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import {
  AitCreditLedger,
  AvailableCreditSummary,
  CreditApplication,
  ApplyAitCreditPayload,
} from '../models/ait-credit.model';

@Injectable({ providedIn: 'root' })
export class AitCreditService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http);
  }

  // ── Taxpayer: own credits ─────────────────────────────────────────────────

  getMyCredits(): Observable<AitCreditLedger[]> {
    return this.get<AitCreditLedger[]>(API_ENDPOINTS.AIT_CREDIT.MY);
  }

  getAvailableCredits(): Observable<AvailableCreditSummary[]> {
    return this.get<AvailableCreditSummary[]>(API_ENDPOINTS.AIT_CREDIT.MY_AVAILABLE);
  }

  getTotalAvailableCredit(): Observable<{ totalAvailableCredit: number }> {
    return this.get<{ totalAvailableCredit: number }>(API_ENDPOINTS.AIT_CREDIT.MY_TOTAL);
  }

  getById(id: number): Observable<AitCreditLedger> {
    return this.get<AitCreditLedger>(API_ENDPOINTS.AIT_CREDIT.BY_ID(id));
  }

  // ── Officer: by taxpayer ──────────────────────────────────────────────────

  getByTaxpayerId(taxpayerId: number): Observable<AitCreditLedger[]> {
    return this.get<AitCreditLedger[]>(API_ENDPOINTS.AIT_CREDIT.BY_TAXPAYER(taxpayerId));
  }

  // ── Apply during ITR filing ───────────────────────────────────────────────

  applyCredits(payload: ApplyAitCreditPayload): Observable<CreditApplication[]> {
    return this.post<CreditApplication[]>(API_ENDPOINTS.AIT_CREDIT.APPLY, payload);
  }

  // ── ITR-linked ────────────────────────────────────────────────────────────

  getApplicationsForItr(itrId: number): Observable<CreditApplication[]> {
    return this.get<CreditApplication[]>(API_ENDPOINTS.AIT_CREDIT.ITR_APPLICATIONS(itrId));
  }

  getTotalAppliedToItr(itrId: number): Observable<{ totalAitCreditApplied: number }> {
    return this.get<{ totalAitCreditApplied: number }>(
      API_ENDPOINTS.AIT_CREDIT.ITR_TOTAL(itrId));
  }
}
