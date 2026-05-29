import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../.././../core/services/base-api.service';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import {
  AitRecord,
  AitDetailResponse,
  CreateAitPayload,
  SubmitAitPayload,
  ChallanVerifyPayload,
  ApproveAitPayload,
  RejectAitPayload,
  AitDocument,
  DocumentRequest,
} from '../models/ait.model';

@Injectable({ providedIn: 'root' })
export class AitService extends BaseApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────

  create(payload: CreateAitPayload): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.CREATE, payload);
  }

  getAll(): Observable<AitRecord[]> {
    // No mock fallback — backend errors surface to the component
    return this.get<AitRecord[]>(API_ENDPOINTS.AITS.LIST);
  }

  getById(id: number): Observable<AitDetailResponse> {
    return this.get<AitDetailResponse>(API_ENDPOINTS.AITS.BY_ID(id));
  }

  update(id: number, payload: CreateAitPayload): Observable<AitRecord> {
    return this.put<AitRecord>(API_ENDPOINTS.AITS.BY_ID(id), payload);
  }

  deleteAIT(id: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.AITS.BY_ID(id));
  }

  // ── Workflow ─────────────────────────────────────────────────────────────────

  submit(id: number, payload: SubmitAitPayload): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.SUBMIT(id), payload);
  }

  verifyChallan(
    id: number,
    payload: ChallanVerifyPayload,
  ): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.VERIFY_CHALLAN(id), payload);
  }

  assignToMe(id: number): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.ASSIGN(id), {});
  }

  approve(id: number, payload: ApproveAitPayload): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.APPROVE(id), payload);
  }

  reject(id: number, payload: RejectAitPayload): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.REJECT(id), payload);
  }

  resubmit(id: number): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.RESUBMIT(id), {});
  }

  credit(id: number): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.CREDIT(id), {});
  }

  // ── Queue ────────────────────────────────────────────────────────────────────

  getPendingQueue(): Observable<AitRecord[]> {
    return this.get<AitRecord[]>(API_ENDPOINTS.AITS.QUEUE_PENDING);
  }

  getMyQueue(): Observable<AitRecord[]> {
    return this.get<AitRecord[]>(API_ENDPOINTS.AITS.QUEUE_MINE);
  }

  // ── Documents ─────────────────────────────────────────────────────────────────

  uploadDocument(aitId: number, file: File): Observable<AitDocument> {
    const form = new FormData();
    form.append('file', file);
    return this.post<AitDocument>(
      API_ENDPOINTS.AITS.DOCUMENTS.UPLOAD(aitId),
      form,
    );
  }

  getDocuments(aitId: number): Observable<AitDocument[]> {
    return this.get<AitDocument[]>(API_ENDPOINTS.AITS.DOCUMENTS.LIST(aitId));
  }

  deleteDocument(aitId: number, docId: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.AITS.DOCUMENTS.DELETE(aitId, docId));
  }

  // ── Document requests ─────────────────────────────────────────────────────────

  getPendingDocumentRequests(): Observable<DocumentRequest[]> {
    return this.get<DocumentRequest[]>(API_ENDPOINTS.AITS.DOC_REQUESTS_PENDING);
  }

  // ----- Search Taxpayer--------

  searchTaxpayers(term: string): Observable<any[]> {
    return this.get<any[]>(
      `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(term)}`,
    );
  }

  downloadCertificate(id: number): Observable<Blob> {
    return this.http.get(API_ENDPOINTS.AITS.CERTIFICATE(id), {
      responseType: 'blob'
    });
  }
  
}
