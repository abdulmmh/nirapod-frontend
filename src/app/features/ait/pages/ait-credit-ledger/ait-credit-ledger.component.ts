// ait-credit-ledger.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AitCreditService } from '../../services/ait-credit.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import {
  AitCreditLedger,
  CreditLedgerStatus,
  CREDIT_STATUS_LABELS,
  CREDIT_STATUS_CLASSES,
} from '../../models/ait-credit.model';
import { AIT_SOURCE_LABELS } from '../../models/ait.model';

@Component({
  selector: 'app-ait-credit-ledger',
  templateUrl: './ait-credit-ledger.component.html',
  styleUrls:  ['./ait-credit-ledger.component.css'],
})
export class AitCreditLedgerComponent implements OnInit, OnDestroy {

  credits:  AitCreditLedger[] = [];
  filtered: AitCreditLedger[] = [];
  filterStatus = '';
  isLoading = false;

  // KPI totals
  totalCredited  = 0;
  totalAvailable = 0;
  totalUsed      = 0;

  // Detail modal
  selectedCredit: AitCreditLedger | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private creditService: AitCreditService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCredits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCredits(): void {
    this.isLoading = true;
    this.creditService.getMyCredits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.credits  = data;
          this.applyFilter();
          this.computeKpis();
          this.isLoading = false;
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Failed to load credit ledger.');
          this.isLoading = false;
        },
      });
  }

  applyFilter(): void {
    this.filtered = !this.filterStatus
      ? this.credits
      : this.credits.filter(c => c.status === this.filterStatus);
  }

  countByStatus(status: string): number {
    return this.credits.filter(c => c.status === status).length;
  }

  computeKpis(): void {
    this.totalCredited  = this.credits.reduce((s, c) => s + c.creditedAmount,  0);
    this.totalUsed      = this.credits.reduce((s, c) => s + c.usedAmount,      0);
    this.totalAvailable = this.credits
      .filter(c => c.status !== 'FULLY_USED' && c.status !== 'EXPIRED')
      .reduce((s, c) => s + c.remainingAmount, 0);
  }

  viewDetail(id: number): void {
    this.isLoading = true;
    this.creditService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.selectedCredit = detail;
          this.isLoading = false;
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Failed to load detail.');
          this.isLoading = false;
        },
      });
  }

  closeDetail(): void {
    this.selectedCredit = null;
  }

  // ── Display helpers ─────────────────────────────────────────────────────────

  getStatusLabel(status: CreditLedgerStatus): string {
    return CREDIT_STATUS_LABELS[status] ?? status;
  }

  getStatusClass(status: CreditLedgerStatus): string {
    return CREDIT_STATUS_CLASSES[status] ?? '';
  }

  getSourceLabel(source: string): string {
    return (AIT_SOURCE_LABELS as any)[source] ?? source;
  }

  getSourceClass(source: string): string {
    const map: Record<string, string> = {
      IMPORT: 'cat-import', SUPPLIER: 'cat-supplier',
      SALARY: 'cat-salary', CONTRACTOR: 'cat-contractor', RENT: 'cat-rent',
    };
    return map[source] ?? '';
  }

  getSourceIcon(source: string): string {
    const map: Record<string, string> = {
      IMPORT: 'bi-box-seam', SUPPLIER: 'bi-truck',
      SALARY: 'bi-person-badge', CONTRACTOR: 'bi-tools', RENT: 'bi-building',
    };
    return map[source] ?? 'bi-receipt';
  }

  formatCurrency(value: number | undefined): string {
    if (value == null) return '৳0';
    return '৳' + value.toLocaleString('en-BD', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
  }
}
