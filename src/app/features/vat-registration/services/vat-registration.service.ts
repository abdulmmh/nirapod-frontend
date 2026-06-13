import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { ToastService } from '../../../shared/toast/toast.service';
import {
  VatRegistration,
  VatRegistrationCreateRequest,
  VatRegistrationUpdateRequest,
} from '../../../models/vat-registration.model';

@Injectable({ providedIn: 'root' })
export class VatRegistrationService {
  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}


  // ── Read: all ──────────────────────────────────────────────────────────────

  getAll(): Observable<VatRegistration[]> {
    return this.http.get<VatRegistration[]>(
      API_ENDPOINTS.VAT_REGISTRATIONS.LIST,
    );
  }

  // ── Read: by ID ────────────────────────────────────────────────────────────

  getById(id: number): Observable<VatRegistration> {
    return this.http.get<VatRegistration>(
      API_ENDPOINTS.VAT_REGISTRATIONS.GET(id),
    );
  }

  // ── Write: create ──────────────────────────────────────────────────────────

  create(payload: VatRegistrationCreateRequest): Observable<VatRegistration> {
    return this.http.post<VatRegistration>(
      API_ENDPOINTS.VAT_REGISTRATIONS.CREATE,
      payload,
    );
  }

  // ── Write: update ──────────────────────────────────────────────────────────

  update(
    id: number,
    data: VatRegistrationUpdateRequest,
  ): Observable<VatRegistration> {
    return this.http.put<VatRegistration>(
      API_ENDPOINTS.VAT_REGISTRATIONS.UPDATE(id),
      data,
    );
  }

  uploadDocuments(id: number, formData: FormData): Observable<VatRegistration> {
    return this.http.post<VatRegistration>(
      API_ENDPOINTS.VAT_REGISTRATIONS.UPLOAD_DOCUMENTS(id),
      formData,
    );
  }

  // ── Write: delete (soft) ───────────────────────────────────────────────────

  remove(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.VAT_REGISTRATIONS.DELETE(id));
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private handleReadError<T>(
    err: HttpErrorResponse,
    fallback: T,
  ): Observable<T> {
    if (err.status === 0) {
      this.toast.warning(
        'Server unreachable — showing offline data. Changes cannot be saved.',
      );
      return of(fallback);
    }
    return throwError(() => err);
  }

  updateStatus(
    id: number,
    status: string,
    remarks?: string,
  ): Observable<VatRegistration> {
    return this.http.patch<VatRegistration>(
      API_ENDPOINTS.VAT_REGISTRATIONS.UPDATE_STATUS(id),
      { status, remarks },
    );
  }
}
