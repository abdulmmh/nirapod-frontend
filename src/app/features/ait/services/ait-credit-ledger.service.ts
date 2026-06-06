// ✅ ait-credit-ledger.service.ts — complete rewrite
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { AitCreditLedger } from '../models/ait-credit-ledger.model';
import {
  AvailableCreditSummary,
  CreditApplication,
  ApplyAitCreditPayload,
} from '../models/ait-credit-ledger.model';

@Injectable({ providedIn: 'root' })
export class AitCreditLedgerService extends BaseApiService {

  constructor(http: HttpClient) { super(http); }

  // ── Taxpayer: নিজের credits দেখা ────────────────────────────────────────

  getMyCredits(): Observable<AitCreditLedger[]> {
    return this.get<AitCreditLedger[]>(API_ENDPOINTS.AIT_CREDIT_LEDGER.MY);
  }

  getAvailableCredits(): Observable<AvailableCreditSummary[]> {
    return this.get<AvailableCreditSummary[]>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.MY_AVAILABLE
    );
  }

  getTotalAvailableCredit(): Observable<{ totalAvailableCredit: number }> {
    return this.get<{ totalAvailableCredit: number }>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.MY_TOTAL
    );
  }

  getById(id: number): Observable<AitCreditLedger> {
    return this.get<AitCreditLedger>(API_ENDPOINTS.AIT_CREDIT_LEDGER.BY_ID(id));
  }

  // ── Officer: taxpayer-এর credits দেখা ───────────────────────────────────

  getByTaxpayerId(taxpayerId: number): Observable<AitCreditLedger[]> {
    return this.get<AitCreditLedger[]>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.BY_TAXPAYER(taxpayerId)
    );
  }

  // ── ITR filing-এ credit apply করা ───────────────────────────────────────

  applyCredits(payload: ApplyAitCreditPayload): Observable<CreditApplication[]> {
    return this.post<CreditApplication[]>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.APPLY,
      payload
    );
  }

  // ── ITR-linked queries ───────────────────────────────────────────────────

  getApplicationsForItr(itrId: number): Observable<CreditApplication[]> {
    return this.get<CreditApplication[]>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.ITR_APPLICATIONS(itrId)
    );
  }

  getTotalAppliedToItr(itrId: number): Observable<{ totalAitCreditApplied: number }> {
    return this.get<{ totalAitCreditApplied: number }>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.ITR_TOTAL(itrId)
    );
  }
}