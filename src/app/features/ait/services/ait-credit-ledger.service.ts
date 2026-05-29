// ait-credit-ledger.service.ts
// Add to: src/app/features/ait/services/ait-credit-ledger.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '../../../core/services/base-api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import {
  AitCreditLedger,
  ApplyAitCreditPayload,
  CreditRemainingSummary,
} from '../../../models/ait-credit-ledger.model';

@Injectable({ providedIn: 'root' })
export class AitCreditLedgerService extends BaseApiService {

  constructor(http: HttpClient) {
    super(http);
  }

  getAll(): Observable<AitCreditLedger[]> {
    return this.get<AitCreditLedger[]>(API_ENDPOINTS.AIT_CREDIT_LEDGER.BASE);
  }

  getById(id: number): Observable<AitCreditLedger> {
    return this.get<AitCreditLedger>(API_ENDPOINTS.AIT_CREDIT_LEDGER.BY_ID(id));
  }

  getAvailable(taxpayerId: number): Observable<AitCreditLedger[]> {
    return this.get<AitCreditLedger[]>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.AVAILABLE(taxpayerId)
    );
  }

  getRemainingSummary(
    taxpayerId: number,
    fiscalYearId: number
  ): Observable<CreditRemainingSummary> {
    return this.get<CreditRemainingSummary>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.REMAINING_SUMMARY,
      { taxpayerId, fiscalYearId }
    );
  }

  applyToItr(
    ledgerId: number,
    payload: ApplyAitCreditPayload
  ): Observable<AitCreditLedger> {
    return this.post<AitCreditLedger>(
      API_ENDPOINTS.AIT_CREDIT_LEDGER.APPLY_TO_ITR(ledgerId),
      payload
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD TO api.constants.ts — inside API_ENDPOINTS object:
// ─────────────────────────────────────────────────────────────────────────────
//
//   AIT_CREDIT_LEDGER: {
//     BASE:              `${API_BASE_URL}/ait-credit-ledger`,
//     BY_ID:             (id: number) => `${API_BASE_URL}/ait-credit-ledger/${id}`,
//     AVAILABLE:         (taxpayerId: number) =>
//                          `${API_BASE_URL}/ait-credit-ledger/available/${taxpayerId}`,
//     REMAINING_SUMMARY: `${API_BASE_URL}/ait-credit-ledger/remaining-summary`,
//     APPLY_TO_ITR:      (id: number) =>
//                          `${API_BASE_URL}/ait-credit-ledger/${id}/apply-to-itr`,
//   },
