// certificate-view.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { CertificateService } from '../../services/certificate.service';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-certificate-view',
  templateUrl: './certificate-view.component.html',
  styleUrls: ['./certificate-view.component.css']
})
export class CertificateViewComponent implements OnInit, OnDestroy {

  // ── State ────────────────────────────────────────────────────────────────
  record: any = null;
  certType: 'tin' | 'bin' = 'tin';
  sourceId = 0;
  isLoading    = false;
  isDownloading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private certService: CertificateService,
    private toast: ToastService
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const type = this.route.snapshot.paramMap.get('type') ?? 'tin';
    const id   = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) { this.router.navigate(['/certificates']); return; }

    this.certType = (type === 'bin') ? 'bin' : 'tin';
    this.sourceId = id;
    this.loadRecord();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data ─────────────────────────────────────────────────────────────────

  private loadRecord(): void {
    this.isLoading = true;
    const url = this.certType === 'tin'
      ? API_ENDPOINTS.TINS.GET(this.sourceId)
      : API_ENDPOINTS.VAT_REGISTRATIONS.GET(this.sourceId);

    this.http.get<any>(url)
      .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false))
      .subscribe({
        next:  (data) => this.record = data,
        error: () => { this.toast.error('Failed to load record'); this.onBack(); }
      });
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  onDownload(): void {
    this.isDownloading = true;
    const call$ = this.certType === 'tin'
      ? this.certService.downloadTinCertificate(this.sourceId)
      : this.certService.downloadBinCertificate(this.sourceId);

    call$
      .pipe(takeUntil(this.destroy$), finalize(() => this.isDownloading = false))
      .subscribe({
        next: (response) => {
          const blob     = response.body as Blob;
          const certNo   = this.certType === 'tin'
            ? `CERT-TIN-${this.sourceId.toString().padStart(4,'0')}`
            : `CERT-BIN-${this.sourceId.toString().padStart(4,'0')}`;
          const url      = URL.createObjectURL(blob);
          const a        = document.createElement('a');
          a.href         = url;
          a.download     = `${certNo}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          this.toast.success('Certificate downloaded');
        },
        error: () => this.toast.error('Download failed')
      });
  }

  onBack(): void {
    this.router.navigate(['/certificates']);
  }

  // ── UI Helpers ───────────────────────────────────────────────────────────

  get certNo(): string {
    const prefix = this.certType === 'tin' ? 'TIN' : 'BIN';
    return `CERT-${prefix}-${this.sourceId.toString().padStart(4, '0')}`;
  }

  get holderName(): string {
    if (!this.record) return '';
    return this.certType === 'tin' ? this.record.taxpayerName : this.record.businessName;
  }

  get referenceNo(): string {
    if (!this.record) return '';
    return this.certType === 'tin' ? this.record.tinNumber : this.record.binNo;
  }

  get issuedDate(): string {
    if (!this.record) return '';
    return this.certType === 'tin' ? this.record.issuedDate : this.record.registrationDate;
  }

  get expiryDate(): string | null {
    return this.record?.expiryDate ?? null;
  }

  get status(): string {
    return this.record?.status ?? '';
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Active: 'status-active', Inactive: 'status-expired',
      Suspended: 'status-revoked', Cancelled: 'status-revoked', Pending: 'status-pending'
    };
    return map[s] ?? '';
  }
}
