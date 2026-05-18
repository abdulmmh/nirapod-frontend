import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { ToastService } from '../../../shared/toast/toast.service';
import {
  VatRegistration,
  VatRegistrationCreateRequest,
} from '../../../models/vat-registration.model';

@Injectable({ providedIn: 'root' })
export class VatRegistrationService {

  constructor(
    private http:  HttpClient,
    private toast: ToastService,
  ) {}

  // ── Mock data ─────────────────────────────────────────────────────────────
  private readonly MOCK: VatRegistration[] = [
    {
      id: 1,
      binNo: 'BIN-2026-1-0001',
      tinNumber: '234567890012',
      businessName: 'Rahman Brothers Trading Co.',
      ownerName: 'Abdur Rahman',
      vatCategory: 'Standard',
      businessType: 'Sole Proprietorship',
      businessCategory: 'Trading',
      tradeLicenseNo: 'TL/DCC/2024/0045',
      registrationDate: '2026-01-10',
      effectiveDate: '2026-02-01',
      expiryDate: '',
      annualTurnover: 3_500_000,
      email: 'rahman.trading@example.com',
      phone: '01711-234567',
      address: '45 Motijheel C/A, Dhaka-1000',
      district: 'Dhaka',
      division: 'Dhaka',
      vatZone: 'Dhaka North VAT Zone',
      vatCircle: 'Circle-01',
      zoneId: 1,
      status: 'Active',
      remarks: '',
    },
    {
      id: 2,
      binNo: 'BIN-2026-2-0003',
      tinNumber: '345678901123',
      businessName: 'Sylhet Agro Products Ltd.',
      ownerName: 'Nurul Islam',
      vatCategory: 'Zero Rated',
      businessType: 'Private Limited Company',
      businessCategory: 'Agriculture',
      tradeLicenseNo: 'TL/SCC/2023/0112',
      registrationDate: '2026-02-14',
      effectiveDate: '2026-03-01',
      expiryDate: '2027-02-28',
      annualTurnover: 12_000_000,
      email: 'sylhet.agro@example.com',
      phone: '01811-345678',
      address: '12 Amberkhana, Sylhet-3100',
      district: 'Sylhet',
      division: 'Sylhet',
      vatZone: 'Sylhet VAT Zone',
      vatCircle: 'Circle-04',
      zoneId: 2,
      status: 'Active',
      remarks: 'Agricultural export — zero rated',
    },
    {
      id: 3,
      binNo: 'BIN-2026-3-0007',
      tinNumber: '456789012234',
      businessName: 'Chittagong Marine Supplies',
      ownerName: 'Karim Hossain',
      vatCategory: 'Standard',
      businessType: 'Partnership',
      businessCategory: 'Marine & Logistics',
      tradeLicenseNo: 'TL/CCC/2024/0278',
      registrationDate: '2026-03-05',
      effectiveDate: '2026-04-01',
      expiryDate: '',
      annualTurnover: 8_750_000,
      email: 'ctg.marine@example.com',
      phone: '01911-456789',
      address: '88 Agrabad C/A, Chattogram-4100',
      district: 'Chattogram',
      division: 'Chattogram',
      vatZone: 'Chattogram VAT Zone',
      vatCircle: 'Circle-07',
      zoneId: 3,
      status: 'Pending',
      remarks: 'New registration — awaiting zone officer verification',
    },
    {
      id: 4,
      binNo: 'BIN-2026-1-0012',
      tinNumber: '567890123345',
      businessName: 'Dhaka Tech Solutions',
      ownerName: 'Farida Begum',
      vatCategory: 'Exempt',
      businessType: 'Private Limited Company',
      businessCategory: 'Software & IT',
      tradeLicenseNo: 'TL/DCC/2024/0589',
      registrationDate: '2026-03-20',
      effectiveDate: '2026-04-01',
      expiryDate: '',
      annualTurnover: 5_200_000,
      email: 'dhaka.tech@example.com',
      phone: '01611-567890',
      address: '22 Gulshan-2, Dhaka-1212',
      district: 'Dhaka',
      division: 'Dhaka',
      vatZone: 'Dhaka North VAT Zone',
      vatCircle: 'Circle-02',
      zoneId: 1,
      status: 'Inactive',
      remarks: 'Software export — VAT exempt',
    },
  ];

  // ── Read: all ──────────────────────────────────────────────────────────────


  getAll(): Observable<VatRegistration[]> {
    return this.http
      .get<VatRegistration[]>(API_ENDPOINTS.VAT_REGISTRATIONS.LIST)
      .pipe(catchError(err => this.handleReadError(err, this.MOCK)));
  }

  // ── Read: by ID ────────────────────────────────────────────────────────────

  getById(id: number): Observable<VatRegistration> {
    return this.http
      .get<VatRegistration>(API_ENDPOINTS.VAT_REGISTRATIONS.GET(id))
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 0) {
            const mock = this.MOCK.find(r => r.id === id);
            if (mock) {
              this.toast.warning('Server unreachable — showing offline data.');
              return of(mock);
            }
          }
          return throwError(() => err);
        }),
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

  update(id: number, data: Partial<VatRegistration>): Observable<VatRegistration> {
    return this.http.put<VatRegistration>(
      API_ENDPOINTS.VAT_REGISTRATIONS.UPDATE(id),
      data,
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
}