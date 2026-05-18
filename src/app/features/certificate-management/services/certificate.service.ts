// certificate.service.ts  — REPLACE করো Phase 1&2 এর service টা
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { TaxClearanceCreateRequest, PublicVerifyResult } from '../models/certificate.model';

@Injectable({ providedIn: 'root' })
export class CertificateService {

  constructor(private http: HttpClient) {}

  // ── TIN ──────────────────────────────────────────────────────────────────
  getTins(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.TINS.LIST);
  }

  downloadTinCertificate(tinId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(
      API_ENDPOINTS.CERTIFICATES.DOWNLOAD_TIN(tinId),
      { observe: 'response', responseType: 'blob' }
    );
  }

  // ── BIN ──────────────────────────────────────────────────────────────────
  getVatRegistrations(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.VAT_REGISTRATIONS.LIST);
  }

  downloadBinCertificate(vatId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(
      API_ENDPOINTS.CERTIFICATES.DOWNLOAD_BIN(vatId),
      { observe: 'response', responseType: 'blob' }
    );
  }

  // ── Tax Clearance ─────────────────────────────────────────────────────────
  getTaxClearances(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.CERTIFICATES.TAX_CLEARANCE_LIST);
  }

  createTaxClearance(req: TaxClearanceCreateRequest): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.CERTIFICATES.TAX_CLEARANCE_LIST, req);
  }

  approveTaxClearance(id: number): Observable<any> {
    return this.http.patch<any>(
      `${API_ENDPOINTS.CERTIFICATES.TAX_CLEARANCE_LIST}/${id}/approve`, {}
    );
  }

  revokeTaxClearance(id: number, remarks: string): Observable<any> {
    return this.http.patch<any>(
      `${API_ENDPOINTS.CERTIFICATES.TAX_CLEARANCE_LIST}/${id}/revoke`,
      { remarks }
    );
  }

  downloadTaxClearanceCertificate(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(
      API_ENDPOINTS.CERTIFICATES.DOWNLOAD_TAX_CLEARANCE(id),
      { observe: 'response', responseType: 'blob' }
    );
  }

  // ── Return Acknowledgment ─────────────────────────────────────────────────
  getIncomeTaxReturns(): Observable<any[]> {
    return this.http.get<any[]>(API_ENDPOINTS.INCOME_TAX_RETURNS.LIST);
  }

  downloadReturnAcknowledgment(itrId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(
      API_ENDPOINTS.CERTIFICATES.DOWNLOAD_RETURN_ACK(itrId),
      { observe: 'response', responseType: 'blob' }
    );
  }

  // ── Public Verify ─────────────────────────────────────────────────────────
  publicVerify(certNo: string): Observable<PublicVerifyResult> {
    return this.http.get<PublicVerifyResult>(
      `${API_ENDPOINTS.CERTIFICATES.PUBLIC_VERIFY}?certNo=${encodeURIComponent(certNo)}`
    );
  }
}
