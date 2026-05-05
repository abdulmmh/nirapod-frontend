import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { API_ENDPOINTS }            from 'src/app/core/constants/api.constants';
import { AuthService }              from 'src/app/core/services/auth.service';
import {
  TaxStructure,
  TaxStructureCreateRequest,
  TaxStructureUpdateRequest,
  TaxMasterData,
  TaxPreviewResponse,
  TaxPreviewRequest,
} from '../../models/tax-structure.model';

/** Fallback master data shown when the API is unreachable (e.g. during development). */
const FALLBACK_MASTER: TaxMasterData = {
  taxTypes:   ['VAT', 'AIT', 'Import Duty', 'Income Tax', 'Excise Duty', 'Supplementary Duty', 'Other'],
  applicables: ['All', 'Individual', 'Company', 'Import', 'Export', 'Service', 'Goods'],
  statuses:   ['Active', 'Inactive', 'Expired'],
  rateTypes:  [
    { value: 'FLAT', label: 'Flat Rate' },
    { value: 'SLAB', label: 'Progressive Slabs' },
  ],
};

@Injectable({ providedIn: 'root' })
export class TaxStructureService {

  constructor(
    private http:        HttpClient,
    private authService: AuthService,
  ) {}

  // ── Master Data ────────────────────────────────────────────────────────────

  /**
   * Fetch dropdown reference values from the backend.
   * Falls back to FALLBACK_MASTER if the API is unavailable.
   */
  getMasterData(): Observable<TaxMasterData> {
    return this.http
      .get<TaxMasterData>(API_ENDPOINTS.TAX_STRUCTURES.MASTER_DATA)
      .pipe(catchError(() => of(FALLBACK_MASTER)));
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  getAll(): Observable<TaxStructure[]> {
    return this.http.get<TaxStructure[]>(API_ENDPOINTS.TAX_STRUCTURES.LIST);
  }

  getById(id: number): Observable<TaxStructure> {
    return this.http.get<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.GET(id));
  }

  create(payload: TaxStructureCreateRequest): Observable<TaxStructure> {
    return this.http.post<TaxStructure>(API_ENDPOINTS.TAX_STRUCTURES.CREATE, payload);
  }

  /**
   * Sends X-Updated-By header so the backend can populate the audit-trail field.
   */
  update(id: number, payload: TaxStructureUpdateRequest): Observable<TaxStructure> {
    const updatedBy = this.authService.currentUser?.fullName
                   || this.authService.currentUser?.fullName
                   || 'unknown';
    const headers = new HttpHeaders({ 'X-Updated-By': updatedBy });
    return this.http.put<TaxStructure>(
      API_ENDPOINTS.TAX_STRUCTURES.UPDATE(id), payload, { headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.TAX_STRUCTURES.DELETE(id));
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  /**
   * Ad-hoc preview (Create page — no saved ID yet).
   * POST /api/tax-structures/preview
   */
  previewAdHoc(req: TaxPreviewRequest): Observable<TaxPreviewResponse> {
    return this.http.post<TaxPreviewResponse>(
      API_ENDPOINTS.TAX_STRUCTURES.PREVIEW_ADHOC, req);
  }

  /**
   * Preview using a saved TaxStructure (Edit / View pages).
   * POST /api/tax-structures/{id}/preview
   */
  previewById(id: number, amount: number): Observable<TaxPreviewResponse> {
    return this.http.post<TaxPreviewResponse>(
      API_ENDPOINTS.TAX_STRUCTURES.PREVIEW(id), { amount });
  }
}