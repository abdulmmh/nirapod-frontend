import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ImportDuty } from '../../../../models/import-duty.model';

@Component({
  selector: 'app-import-duty-list',
  templateUrl: './import-duty-list.component.html',
  styleUrls: ['./import-duty-list.component.css'],
})
export class ImportDutyListComponent implements OnInit, OnDestroy {
  records: ImportDuty[] = [];
  searchTerm = '';
  isLoading = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;
  private destroy$ = new Subject<void>();



  constructor(private router: Router, private toast: ToastService, private http: HttpClient) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<ImportDuty[]>(API_ENDPOINTS.IMPORT_DUTIES.LIST).pipe(takeUntil(this.destroy$)).subscribe({
      next: records => { this.records = records; this.isLoading = false; },
      error: () => { this.records = []; this.isLoading = false; this.toast.error('Failed to load import duty records.'); },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private record(
    id: number,
    dutyRef: string,
    tinNumber: string,
    taxpayerName: string,
    businessName: string,
    productName: string,
    hsCode: string,
    goodsDescription: string,
    originCountry: string,
    cifValue: number,
    cdRate: number,
    customsDuty: number,
    supplementaryDuty: number,
    vat: number,
    advanceIncomeTax: number,
    advanceTax: number,
    totalPayable: number,
    paidAmount: number,
    portOfEntry: string,
    boeNumber: string,
    boeDate: string,
    billOfLading: string,
    importDate: string,
    assessmentDate: string,
    status: ImportDuty['status'],
    remarks: string,
  ): ImportDuty {
    return {
      id,
      dutyRef,
      tinNumber,
      taxpayerName,
      businessName,
      productName,
      hsCode,
      goodsDescription,
      originCountry,
      cifValue,
      cdRate,
      sdRate: 0,
      vatRate: vat > 0 ? 15 : 0,
      aitRate: advanceIncomeTax > 0 ? 5 : 0,
      atRate: advanceTax > 0 ? 5 : 0,
      customsDuty,
      supplementaryDuty,
      vat,
      advanceIncomeTax,
      advanceTax,
      totalPayable,
      paidAmount,
      portOfEntry,
      boeNumber,
      boeDate,
      billOfLading,
      importDate,
      assessmentDate,
      status,
      remarks,
    };
  }

  get filtered(): ImportDuty[] {
    if (!this.searchTerm.trim()) return this.records;
    const term = this.searchTerm.toLowerCase();
    return this.records.filter(
      (r) =>
        r.dutyRef.toLowerCase().includes(term) ||
        r.taxpayerName.toLowerCase().includes(term) ||
        r.businessName.toLowerCase().includes(term) ||
        r.productName.toLowerCase().includes(term) ||
        r.originCountry.toLowerCase().includes(term) ||
        r.portOfEntry.toLowerCase().includes(term) ||
        r.boeNumber.toLowerCase().includes(term),
    );
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Draft: 'status-draft',
      Pending: 'status-pending',
      Assessed: 'status-review',
      Paid: 'status-paid',
      Cleared: 'status-active',
      Disputed: 'status-suspended',
    };
    return map[s] ?? '';
  }

  formatCurrency(a: number): string {
    if (a === 0) return 'BDT 0';
    if (a >= 100000) return `BDT ${(a / 100000).toFixed(2)}L`;
    return `BDT ${a.toLocaleString('en-BD')}`;
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.resetDeleteState();
    this.delete(id);
  }

  private delete(id: number): void {
    this.http.delete(API_ENDPOINTS.IMPORT_DUTIES.GET(id)).subscribe({
      next: () => { this.records = this.records.filter(r => r.id !== id); this.toast.success('Import duty record deleted.'); },
      error: () => this.toast.error('Could not delete this record.'),
    });
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  view(id: number): void {
    this.router.navigate(['/import-duty/view', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/import-duty/edit', id]);
  }
}
