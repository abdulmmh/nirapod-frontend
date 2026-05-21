// ─── audit.service.ts ────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuditCase, AuditCaseCreateRequest, AuditFinding, AuditFindingRequest,
  AuditQuery, AuditDocumentRequest, Assessment, AssessmentProposeRequest,
  DemandNotice, PageResult
} from '../../../models/audit.model';

const OFFICER_BASE  = '/api/audits';
const TAXPAYER_BASE = '/api/my-portal/audits';

@Injectable({ providedIn: 'root' })
export class AuditService {

  constructor(private http: HttpClient) {}

  // ── Officer: Audit Cases ───────────────────────────────────────────────────

  createCase(req: AuditCaseCreateRequest): Observable<AuditCase> {
    return this.http.post<AuditCase>(OFFICER_BASE, req);
  }

  getCases(status?: string, auditType?: string, fiscalYear?: string,
           priority?: string, page = 0, size = 20): Observable<PageResult<AuditCase>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status)    params = params.set('status', status);
    if (auditType) params = params.set('auditType', auditType);
    if (fiscalYear) params = params.set('fiscalYear', fiscalYear);
    if (priority)  params = params.set('priority', priority);
    return this.http.get<PageResult<AuditCase>>(OFFICER_BASE, { params });
  }

  getCaseById(id: number): Observable<AuditCase> {
    return this.http.get<AuditCase>(`${OFFICER_BASE}/${id}`);
  }

  searchCases(q: string): Observable<AuditCase[]> {
    return this.http.get<AuditCase[]>(`${OFFICER_BASE}/search`, {
      params: new HttpParams().set('q', q)
    });
  }

  updateStatus(id: number, status: string, reason: string): Observable<AuditCase> {
    return this.http.patch<AuditCase>(`${OFFICER_BASE}/${id}/status`, { status, reason });
  }

  issueNotice(id: number, remarks?: string): Observable<AuditCase> {
    return this.http.post<AuditCase>(`${OFFICER_BASE}/${id}/issue-notice`, { remarks });
  }

  deleteCase(id: number): Observable<void> {
    return this.http.delete<void>(`${OFFICER_BASE}/${id}`);
  }

  getKpis(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${OFFICER_BASE}/kpis`);
  }

  // ── Officer: Document Requests ─────────────────────────────────────────────

  requestDocuments(caseId: number, req: {
    requestedDocuments: string;
    requestReason?: string;
    requestType?: string;
    deadline?: string;
  }): Observable<AuditDocumentRequest> {
    return this.http.post<AuditDocumentRequest>(
      `${OFFICER_BASE}/${caseId}/request-documents`, req);
  }

  getDocumentRequests(caseId: number): Observable<AuditDocumentRequest[]> {
    return this.http.get<AuditDocumentRequest[]>(`${OFFICER_BASE}/${caseId}/document-requests`);
  }

  // ── Officer: Queries ───────────────────────────────────────────────────────

  raiseQuery(caseId: number, req: {
    subject: string; queryText: string; queryType?: string; deadline?: string;
  }): Observable<AuditQuery> {
    return this.http.post<AuditQuery>(`${OFFICER_BASE}/${caseId}/queries`, req);
  }

  getQueries(caseId: number): Observable<AuditQuery[]> {
    return this.http.get<AuditQuery[]>(`${OFFICER_BASE}/${caseId}/queries`);
  }

  // ── Officer: Findings ──────────────────────────────────────────────────────

  addFinding(caseId: number, req: AuditFindingRequest): Observable<AuditFinding> {
    return this.http.post<AuditFinding>(`${OFFICER_BASE}/${caseId}/findings`, req);
  }

  getFindings(caseId: number): Observable<AuditFinding[]> {
    return this.http.get<AuditFinding[]>(`${OFFICER_BASE}/${caseId}/findings`);
  }

  // ── Officer: Assessment ────────────────────────────────────────────────────

  proposeAssessment(caseId: number, req: AssessmentProposeRequest): Observable<Assessment> {
    return this.http.post<Assessment>(`${OFFICER_BASE}/${caseId}/propose-assessment`, req);
  }

  getAssessment(caseId: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${OFFICER_BASE}/${caseId}/assessment`);
  }

  approveAssessment(caseId: number, approvalNotes?: string): Observable<Assessment> {
    return this.http.post<Assessment>(`${OFFICER_BASE}/${caseId}/approve-assessment`,
      { approvalNotes });
  }

  issueDemandNotice(caseId: number): Observable<DemandNotice> {
    return this.http.post<DemandNotice>(`${OFFICER_BASE}/${caseId}/issue-demand`, {});
  }

  getDemandNotice(caseId: number): Observable<DemandNotice> {
    return this.http.get<DemandNotice>(`${OFFICER_BASE}/${caseId}/demand-notice`);
  }

  // ── Taxpayer Portal ────────────────────────────────────────────────────────

  getMyAudits(): Observable<AuditCase[]> {
    return this.http.get<AuditCase[]>(`${TAXPAYER_BASE}/my`);
  }

  getMyAuditById(id: number): Observable<AuditCase> {
    return this.http.get<AuditCase>(`${TAXPAYER_BASE}/${id}`);
  }

  respond(caseId: number, req: {
    responseText: string; queryId?: number; documentRequestId?: number;
  }): Observable<AuditCase> {
    return this.http.post<AuditCase>(`${TAXPAYER_BASE}/${caseId}/respond`, req);
  }

  uploadDocuments(caseId: number, files: File[],
                  documentRequestId?: number, description?: string): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (documentRequestId) formData.append('documentRequestId', String(documentRequestId));
    if (description)       formData.append('description', description);
    return this.http.post(`${TAXPAYER_BASE}/${caseId}/upload-documents`, formData);
  }

  getMyAssessment(caseId: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${TAXPAYER_BASE}/${caseId}/assessment`);
  }

  getMyDemandNotice(caseId: number): Observable<DemandNotice> {
    return this.http.get<DemandNotice>(`${TAXPAYER_BASE}/${caseId}/demand-notice`);
  }
}
