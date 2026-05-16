import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { BaseApiService } from '../../../core/services/base-api.service';
import {
  AitRecord,
  AitDetailResponse,
  CreateAitPayload,
  ApproveAitPayload,
  RejectAitPayload,
  CreditAitPayload,
  AitDocument,
  DocumentRequest,
} from '../models/ait.model';
import { MockAitDataService } from './mock-ait-data.service';

@Injectable({ providedIn: 'root' })
export class AitService extends BaseApiService {
  constructor(
    http: HttpClient,
    private mockData: MockAitDataService
  ) {
    super(http);
  }

  // LIST all AITs (role-based filtering on backend)
  getAll(): Observable<AitRecord[]> {
    return this.get<AitRecord[]>(API_ENDPOINTS.AITS.LIST).pipe(
      catchError(err => this.handleReadError(err, this.mockData.getMockRecords()))
    );
  }

  // GET single AIT with detail
  getById(id: number): Observable<AitDetailResponse> {
    return this.get<AitDetailResponse>(API_ENDPOINTS.AITS.GET(id)).pipe(
      catchError(err => this.handleReadError(err, this.mockData.getMockDetail(id)))
    );
  }

  // CREATE new AIT (draft)
  create(payload: CreateAitPayload): Observable<AitRecord> {
    return this.post<AitRecord>(API_ENDPOINTS.AITS.CREATE, payload).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to create AIT'))
    );
  }

  // UPDATE existing AIT (draft only)
  update(id: number, payload: Partial<CreateAitPayload>): Observable<AitRecord> {
    return this.put<AitRecord>(API_ENDPOINTS.AITS.UPDATE(id), payload).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to update AIT'))
    );
  }

  // DELETE AIT
  //  delete(id: number): Observable<void> {
  //   return this.delete<void>(API_ENDPOINTS.AITS.DELETE(id)).pipe(
  //     catchError(err => this.handleWriteError(err, 'Failed to delete AIT'))
  //   );
  // }

  // SUBMIT AIT for review
  submit(id: number, attachmentIds: number[]): Observable<AitRecord> {
    return this.put<AitRecord>(
      API_ENDPOINTS.AITS.SUBMIT(id),
      { attachmentIds }
    ).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to submit AIT'))
    );
  }

  // OFFICER WORKFLOWS
  approve(id: number, payload: ApproveAitPayload): Observable<AitRecord> {
    return this.put<AitRecord>(
      API_ENDPOINTS.AITS.APPROVE(id),
      payload
    ).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to approve AIT'))
    );
  }

  reject(id: number, payload: RejectAitPayload): Observable<AitRecord> {
    return this.put<AitRecord>(
      API_ENDPOINTS.AITS.REJECT(id),
      payload
    ).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to reject AIT'))
    );
  }

  credit(id: number, payload: CreditAitPayload): Observable<AitRecord> {
    return this.put<AitRecord>(
      API_ENDPOINTS.AITS.CREDIT(id),
      payload
    ).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to credit AIT'))
    );
  }

  // OFFICER QUEUES
  getPendingQueue(): Observable<AitRecord[]> {
    return this.get<AitRecord[]>(API_ENDPOINTS.AITS.QUEUE.PENDING).pipe(
      catchError(err => this.handleReadError(err, this.mockData.getMockPendingQueue()))
    );
  }

  getMyAssignedQueue(): Observable<AitRecord[]> {
    return this.get<AitRecord[]>(API_ENDPOINTS.AITS.QUEUE.MY_ASSIGNED).pipe(
      catchError(err => this.handleReadError(err, this.mockData.getMockMyQueue()))
    );
  }

  // DOCUMENT MANAGEMENT
  getDocuments(aitId: number): Observable<AitDocument[]> {
    return this.get<AitDocument[]>(API_ENDPOINTS.AITS.DOCUMENTS.LIST(aitId)).pipe(
      catchError(err => this.handleReadError(err, []))
    );
  }

  uploadDocument(aitId: number, file: File): Observable<AitDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<AitDocument>(
      API_ENDPOINTS.AITS.DOCUMENTS.UPLOAD(aitId),
      formData
    ).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to upload document'))
    );
  }

  deleteDocument(aitId: number, docId: number): Observable<void> {
    return this.delete<void>(
      API_ENDPOINTS.AITS.DOCUMENTS.DELETE(aitId, docId)
    ).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to delete document'))
    );
  }

  // DOCUMENT REQUESTS
  createDocumentRequest(aitId: number, request: Partial<DocumentRequest>): Observable<DocumentRequest> {
    return this.post<DocumentRequest>(
      API_ENDPOINTS.AITS.DOCUMENT_REQUESTS.CREATE(aitId),
      request
    ).pipe(
      catchError(err => this.handleWriteError(err, 'Failed to create document request'))
    );
  }

  getDocumentRequests(aitId: number): Observable<DocumentRequest[]> {
    return this.get<DocumentRequest[]>(API_ENDPOINTS.AITS.DOCUMENT_REQUESTS.LIST(aitId)).pipe(
      catchError(err => this.handleReadError(err, []))
    );
  }

  // ERROR HANDLING
  private handleReadError<T>(err: HttpErrorResponse, fallback: T): Observable<T> {
    if (err.status === 0) {
      console.warn('Server unreachable — using offline data');
      return of(fallback);
    }
    console.error('Read error:', err);
    return throwError(() => err);
  }

  private handleWriteError(err: HttpErrorResponse, message: string): Observable<never> {
    console.error(message, err);
    return throwError(() => new Error(message));
  }
}
