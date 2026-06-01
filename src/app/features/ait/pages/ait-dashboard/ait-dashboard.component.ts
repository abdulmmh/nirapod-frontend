import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { AitService } from '../../services/ait.service';

import {
  AitRecord,
  AitStatus,
  AitSourceType,
  AIT_STATUS_LABELS,
  AIT_STATUS_CLASSES,
  AIT_SOURCE_LABELS,
} from '../../models/ait.model';
import { Role } from 'src/app/core/constants/roles.constants';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-ait-dashboard',
  templateUrl: './ait-dashboard.component.html',
  styleUrls: ['./ait-dashboard.component.css'],
})
export class AitDashboardComponent implements OnInit, OnDestroy {
  records: AitRecord[] = [];
  filtered: AitRecord[] = [];

  filterStatus = '';
  searchControl = new FormControl('');
  isLoading = false;

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  isTaxpayerRole = false;

  private destroy$ = new Subject<void>();

  constructor(
    private aitService: AitService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isTaxpayerRole = this.auth.hasRole(Role.TAXPAYER);
    this.loadRecords();

    // Reactive search — debounced
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilter());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data ────────────────────────────────────────────────────────────────────

  loadRecords(): void {
    this.isLoading = true;
    this.aitService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.records = data;
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          // Real errors surface here — no mock fallback
          const msg = err?.error?.message ?? 'Failed to load AIT records.';
          this.toast.error(msg);
          this.isLoading = false;
        },
      });
  }

  // ── Filter / search ─────────────────────────────────────────────────────────

  setFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  applyFilter(): void {
    const term = (this.searchControl.value ?? '').toLowerCase().trim();
    this.filtered = this.records.filter((r) => {
      const matchesStatus =
        !this.filterStatus || r.status === this.filterStatus;
      const matchesSearch =
        !term ||
        r.aitReferenceNo?.toLowerCase().includes(term) ||
        r.taxpayerName?.toLowerCase().includes(term) ||
        r.taxpayerTin?.toLowerCase().includes(term) ||
        this.getSourceLabel(r.sourceType).toLowerCase().includes(term) ||
        r.fiscalYearName?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }

  countByStatus(status: string): number {
    if (!status) return this.records.length;
    return this.records.filter((r) => r.status === status).length;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  view(id: number): void {
    this.router.navigate(['/ait', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/ait', id, 'edit']);
  }

  get createRoute(): string {
    const url = this.router.url;
    return url.startsWith('/my-portal') ? '/my-portal/ait/create' : '/ait/create';
  }

  // ── Workflow actions ────────────────────────────────────────────────────────

  onResubmit(id: number): void {
    this.aitService
      .resubmit(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Record reopened for correction.');
          this.loadRecords();
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Failed to resubmit.');
        },
      });
  }

  downloadCertificate(id: number): void {
    this.aitService.downloadCertificate(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a   = document.createElement('a');
          a.href     = url;
          a.download = `AIT-Certificate-${id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.toast.success('Certificate downloaded.');
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Download failed.');
        },
      });
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.aitService
      .deleteAIT(this.pendingDeleteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('AIT record deleted.');
          this.showDeleteModal = false;
          this.pendingDeleteId = null;
          this.loadRecords();
        },
        error: (err) => {
          this.toast.error(err?.error?.message ?? 'Failed to delete record.');
          this.showDeleteModal = false;
        },
      });
  }

  // ── Display helpers ─────────────────────────────────────────────────────────

  getStatusLabel(status: AitStatus): string {
    return AIT_STATUS_LABELS[status] ?? status;
  }

  getStatusClass(status: AitStatus): string {
    return AIT_STATUS_CLASSES[status] ?? '';
  }

  getSourceLabel(source: AitSourceType): string {
    return AIT_SOURCE_LABELS[source] ?? source;
  }

  getSourceClass(source: AitSourceType): string {
    const map: Record<AitSourceType, string> = {
      IMPORT: 'cat-import',
      SUPPLIER: 'cat-supplier',
      SALARY: 'cat-salary',
      CONTRACTOR: 'cat-contractor',
      RENT: 'cat-rent',
    };
    return map[source] ?? '';
  }

  getSourceIcon(source: AitSourceType): string {
    const map: Record<AitSourceType, string> = {
      IMPORT: 'bi-box-seam',
      SUPPLIER: 'bi-truck',
      SALARY: 'bi-person-badge',
      CONTRACTOR: 'bi-tools',
      RENT: 'bi-building',
    };
    return map[source] ?? 'bi-receipt';
  }

  formatCurrency(value: number | undefined): string {
    if (value == null) return '৳0';
    return (
      '৳' +
      value.toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
}
