import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuditCase,
  AuditCaseCreateRequest,
  AuditFinding,
  AuditFindingRequest,
  AuditQuery,
  AuditDocumentRequest,
  Assessment,
  AssessmentProposeRequest,
  DemandNotice,
  PageResult,
} from '../../../models/audit.model';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  // ── Officer: Audit Cases ───────────────────────────────────────────────────

  createCase(req: AuditCaseCreateRequest): Observable<AuditCase> {
    return this.http.post<AuditCase>(API_ENDPOINTS.AUDITS.CREATE, req);
  }

  getCases(
    status?: string,
    auditType?: string,
    fiscalYear?: string,
    priority?: string,
    page = 0,
    size = 20,
  ): Observable<PageResult<AuditCase>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status) params = params.set('status', status);
    if (auditType) params = params.set('auditType', auditType);
    if (fiscalYear) params = params.set('fiscalYear', fiscalYear);
    if (priority) params = params.set('priority', priority);
    return this.http.get<PageResult<AuditCase>>(API_ENDPOINTS.AUDITS.LIST, {
      params,
    });
  }

  getCaseById(id: number): Observable<AuditCase> {
    return this.http.get<AuditCase>(API_ENDPOINTS.AUDITS.GET(id));
  }

  searchCases(q: string): Observable<AuditCase[]> {
    return this.http.get<AuditCase[]>(API_ENDPOINTS.AUDITS.SEARCH, {
      params: new HttpParams().set('q', q),
    });
  }

  updateStatus(
    id: number,
    status: string,
    reason: string,
  ): Observable<AuditCase> {
    return this.http.patch<AuditCase>(API_ENDPOINTS.AUDITS.STATUS(id), {
      status,
      reason,
    });
  }

  issueNotice(id: number, remarks?: string): Observable<AuditCase> {
    return this.http.post<AuditCase>(API_ENDPOINTS.AUDITS.ISSUE_NOTICE(id), {
      remarks,
    });
  }

  deleteCase(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.AUDITS.DELETE(id));
  }

  getKpis(): Observable<{ [key: string]: number }> {
    return this.http.get<any>(API_ENDPOINTS.AUDITS.KPIS);
  }

  // ── Officer: Document Requests ─────────────────────────────────────────────

  requestDocuments(caseId: number, req: any): Observable<AuditDocumentRequest> {
    return this.http.post<AuditDocumentRequest>(
      API_ENDPOINTS.AUDITS.REQUEST_DOCS(caseId),
      req,
    );
  }

  getDocumentRequests(caseId: number): Observable<AuditDocumentRequest[]> {
    return this.http.get<AuditDocumentRequest[]>(
      API_ENDPOINTS.AUDITS.DOC_REQUESTS(caseId),
    );
  }

  // ── Officer: Queries ───────────────────────────────────────────────────────

  raiseQuery(caseId: number, req: any): Observable<AuditQuery> {
    return this.http.post<AuditQuery>(
      API_ENDPOINTS.AUDITS.QUERIES(caseId),
      req,
    );
  }

  getQueries(caseId: number): Observable<AuditQuery[]> {
    return this.http.get<AuditQuery[]>(API_ENDPOINTS.AUDITS.QUERIES(caseId));
  }

  // ── Officer: Findings ──────────────────────────────────────────────────────

  addFinding(
    caseId: number,
    req: AuditFindingRequest,
  ): Observable<AuditFinding> {
    return this.http.post<AuditFinding>(
      API_ENDPOINTS.AUDITS.FINDINGS(caseId),
      req,
    );
  }

  getFindings(caseId: number): Observable<AuditFinding[]> {
    return this.http.get<AuditFinding[]>(API_ENDPOINTS.AUDITS.FINDINGS(caseId));
  }
  // ── Officer: Assessment ────────────────────────────────────────────────────

  proposeAssessment(
    caseId: number,
    req: AssessmentProposeRequest,
  ): Observable<Assessment> {
    return this.http.post<Assessment>(
      API_ENDPOINTS.AUDITS.PROPOSE(caseId),
      req,
    );
  }
  getAssessment(caseId: number): Observable<Assessment> {
    return this.http.get<Assessment>(API_ENDPOINTS.AUDITS.ASSESSMENT(caseId));
  }

  approveAssessment(
    caseId: number,
    approvalNotes?: string,
  ): Observable<Assessment> {
    return this.http.post<Assessment>(API_ENDPOINTS.AUDITS.APPROVE(caseId), {
      approvalNotes,
    });
  }

  issueDemandNotice(caseId: number): Observable<DemandNotice> {
    return this.http.post<DemandNotice>(
      API_ENDPOINTS.AUDITS.ISSUE_DEMAND(caseId),
      {},
    );
  }

  getDemandNotice(caseId: number): Observable<DemandNotice> {
    return this.http.get<DemandNotice>(API_ENDPOINTS.AUDITS.DEMAND(caseId));
  }

  // ── Taxpayer Portal ────────────────────────────────────────────────────────

  getMyAudits(): Observable<AuditCase[]> {
    return this.http.get<AuditCase[]>(API_ENDPOINTS.AUDITS.MY_LIST);
  }

  getMyAuditById(id: number): Observable<AuditCase> {
    return this.http.get<AuditCase>(API_ENDPOINTS.AUDITS.MY_GET(id));
  }

  respond(caseId: number, req: any): Observable<AuditCase> {
    return this.http.post<AuditCase>(
      API_ENDPOINTS.AUDITS.MY_RESPOND(caseId),
      req,
    );
  }

  uploadDocuments(
    caseId: number,
    files: File[],
    documentRequestId?: number,
    description?: string,
  ): Observable<any> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (documentRequestId)
      formData.append('documentRequestId', String(documentRequestId));
    if (description) formData.append('description', description);
    return this.http.post(API_ENDPOINTS.AUDITS.MY_UPLOAD(caseId), formData);
  }

  getMyAssessment(caseId: number): Observable<Assessment> {
    return this.http.get<Assessment>(
      API_ENDPOINTS.AUDITS.MY_ASSESSMENT(caseId),
    );
  }

  getMyDemandNotice(caseId: number): Observable<DemandNotice> {
    return this.http.get<DemandNotice>(API_ENDPOINTS.AUDITS.MY_DEMAND(caseId));
  }
}
