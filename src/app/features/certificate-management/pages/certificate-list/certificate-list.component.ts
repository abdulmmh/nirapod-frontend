// certificate-list.component.ts  — REPLACE করো Phase 1&2 এরটা
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CertificateService } from '../../services/certificate.service';
import { Certificate, CertificateType } from '../../models/certificate.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Role } from 'src/app/core/constants/roles.constants';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.css']
})
export class CertificateListComponent implements OnInit, OnDestroy {

  // ── State ────────────────────────────────────────────────────────────────
  certificates: Certificate[] = [];
  isLoading      = false;
  searchTerm     = '';
  activeTab: CertificateType | 'ALL' = 'ALL';
  downloadingId: number | null = null;

  // Officer-only: Tax Clearance create modal
  showCreateModal   = false;
  createLoading     = false;
  tcForm = { taxpayerId: null as number | null, assessmentYear: '', remarks: '' };

  private destroy$ = new Subject<void>();

  constructor(
    private certService: CertificateService,
    private router: Router,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  get isOfficer(): boolean {
    const r = this.authService.currentUser?.role;
    return r === Role.SUPER_ADMIN || r === Role.TAX_COMMISSIONER || r === Role.TAX_OFFICER;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void { this.loadAll(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Data Loading ─────────────────────────────────────────────────────────
  private loadAll(): void {
    this.isLoading = true;
    this.certificates = [];

    forkJoin({
      tins:      this.certService.getTins(),
      vats:      this.certService.getVatRegistrations(),
      clearances: this.certService.getTaxClearances(),
      returns:   this.certService.getIncomeTaxReturns()
    })
    .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false))
    .subscribe({
      next: ({ tins, vats, clearances, returns }) => {
        this.certificates = [
          ...tins.map(t      => this.mapTin(t)),
          ...vats.map(v      => this.mapVat(v)),
          ...clearances.map(c => this.mapClearance(c)),
          ...returns.map(r   => this.mapReturn(r))
        ];
      },
      error: () => this.toast.error('Failed to load certificates', 'error')
    });
  }

  // ── Mappers ───────────────────────────────────────────────────────────────
  private mapTin(t: any): Certificate {
    return {
      id: t.id, type: 'TIN', sourceId: t.id,
      certificateNo: `CERT-TIN-${t.id.toString().padStart(4, '0')}`,
      holderName: t.taxpayerName, referenceNo: t.tinNumber,
      issuedDate: t.issuedDate,
      status: this.normStatus(t.status),
      taxZone: t.taxZone, taxCircle: t.taxCircle
    };
  }

  private mapVat(v: any): Certificate {
    return {
      id: v.id, type: 'BIN', sourceId: v.id,
      certificateNo: `CERT-BIN-${v.id.toString().padStart(4, '0')}`,
      holderName: v.businessName, referenceNo: v.binNo,
      issuedDate: v.registrationDate, expiryDate: v.expiryDate,
      status: this.normStatus(v.status),
      taxZone: v.vatZone, taxCircle: v.vatCircle
    };
  }

  private mapClearance(c: any): Certificate {
    return {
      id: c.id, type: 'TAX_CLEARANCE', sourceId: c.id,
      certificateNo: c.certificateNo,
      holderName: c.taxpayerName, referenceNo: c.tinNumber,
      issuedDate: c.issuedDate, expiryDate: c.validUntil,
      status: c.status, assessmentYear: c.assessmentYear
    };
  }

  private mapReturn(r: any): Certificate {
    return {
      id: r.id, type: 'RETURN_ACK', sourceId: r.id,
      certificateNo: `ACK-${r.returnNo}`,
      holderName: r.taxpayerName, referenceNo: r.returnNo,
      issuedDate: r.submissionDate,
      status: r.status, assessmentYear: r.assessmentYear
    };
  }

  private normStatus(s: string): string {
    const map: Record<string, string> = {
      Active: 'Active', Inactive: 'Expired',
      Suspended: 'Revoked', Cancelled: 'Revoked',
      Pending: 'Pending', APPROVED: 'Active',
      REVOKED: 'Revoked', PENDING: 'Pending'
    };
    return map[s] ?? s;
  }

  // ── Filtering ─────────────────────────────────────────────────────────────
  setTab(tab: CertificateType | 'ALL'): void { this.activeTab = tab; }

  get filtered(): Certificate[] {
    return this.certificates.filter(c => {
      const matchTab    = this.activeTab === 'ALL' || c.type === this.activeTab;
      const term        = this.searchTerm.toLowerCase().trim();
      const matchSearch = !term || [c.holderName, c.referenceNo, c.certificateNo, c.assessmentYear]
        .some(f => f?.toLowerCase().includes(term));
      return matchTab && matchSearch;
    });
  }

  countByType(type: CertificateType): number {
    return this.certificates.filter(c => c.type === type).length;
  }

  // ── Download ──────────────────────────────────────────────────────────────
  onDownload(cert: Certificate, event: Event): void {
    event.stopPropagation();
    this.downloadingId = cert.id;

    const call$ = cert.type === 'TIN'          ? this.certService.downloadTinCertificate(cert.sourceId)
                : cert.type === 'BIN'          ? this.certService.downloadBinCertificate(cert.sourceId)
                : cert.type === 'TAX_CLEARANCE'? this.certService.downloadTaxClearanceCertificate(cert.sourceId)
                :                                this.certService.downloadReturnAcknowledgment(cert.sourceId);

    call$
      .pipe(takeUntil(this.destroy$), finalize(() => this.downloadingId = null))
      .subscribe({
        next: (resp) => {
          const blob = resp.body as Blob;
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href = url; a.download = `${cert.certificateNo}.pdf`; a.click();
          URL.revokeObjectURL(url);
          this.toast.success('Downloaded successfully', 'success');
        },
        error: () => this.toast.error('Download failed', 'error')
      });
  }

  onView(cert: Certificate): void {
    this.router.navigate(['/certificates', cert.type.toLowerCase().replace('_', '-'), cert.sourceId]);
  }

  // ── Tax Clearance Create (officer) ────────────────────────────────────────
  openCreateModal(): void { this.showCreateModal = true; }
  closeCreateModal(): void { this.showCreateModal = false; this.resetTcForm(); }

  onCreateTaxClearance(): void {
    if (!this.tcForm.taxpayerId || !this.tcForm.assessmentYear) {
      this.toast.error('Taxpayer ID and Assessment Year are required', 'error');
      return;
    }
    this.createLoading = true;
    this.certService.createTaxClearance({
      taxpayerId:     this.tcForm.taxpayerId,
      assessmentYear: this.tcForm.assessmentYear,
      remarks:        this.tcForm.remarks
    })
    .pipe(finalize(() => this.createLoading = false))
    .subscribe({
      next: () => {
        this.toast.success('Tax Clearance created successfully', 'success');
        this.closeCreateModal();
        this.loadAll();
      },
      error: (err) => this.toast.error(err?.error?.message ?? 'Create failed', 'error')
    });
  }

  private resetTcForm(): void {
    this.tcForm = { taxpayerId: null, assessmentYear: '', remarks: '' };
  }

  // ── Public Verify navigation ──────────────────────────────────────────────
  goToVerify(): void { this.router.navigate(['/verify']); }

  // ── UI Helpers ────────────────────────────────────────────────────────────
  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      Active: 'status-active', Expired: 'status-expired',
      Revoked: 'status-revoked', Pending: 'status-pending',
      APPROVED: 'status-active', REVOKED: 'status-revoked', PENDING: 'status-pending',
      Submitted: 'status-active', Accepted: 'status-active', Draft: 'status-pending'
    };
    return m[s] ?? '';
  }

  getTypeClass(type: CertificateType): string {
    const m: Record<CertificateType, string> = {
      TIN: 'type-tin', BIN: 'type-bin',
      TAX_CLEARANCE: 'type-tc', RETURN_ACK: 'type-ack'
    };
    return m[type] ?? '';
  }

  getTypeLabel(type: CertificateType): string {
    const m: Record<CertificateType, string> = {
      TIN: 'TIN', BIN: 'BIN', TAX_CLEARANCE: 'Tax Clearance', RETURN_ACK: 'Return Ack.'
    };
    return m[type] ?? type;
  }

  isDownloading(cert: Certificate): boolean { return this.downloadingId === cert.id; }
}
