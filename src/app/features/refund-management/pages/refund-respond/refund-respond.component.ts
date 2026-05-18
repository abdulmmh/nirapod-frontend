import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RefundService, RefundDetail } from '../../services/refund.service';

@Component({
  selector: 'app-refund-respond',
  templateUrl: './refund-respond.component.html',
  styleUrls: ['./refund-respond.component.css'],
})
export class RefundRespondComponent implements OnInit {
  refund: RefundDetail | null = null;
  loading    = true;
  submitting = false;
  errorMsg   = '';
  successMsg = '';

  responseText   = '';
  uploadedFiles: { file: File; type: string; name: string; size: string }[] = [];
  selectedDocType = 'BANK_STATEMENT';
  uploadError     = '';

  readonly documentTypes = [
    { value: 'BANK_STATEMENT',     label: 'Bank Statement'     },
    { value: 'CHALLAN_COPY',       label: 'Challan Copy'       },
    { value: 'ITR_ACKNOWLEDGMENT', label: 'ITR Acknowledgment' },
    { value: 'COURT_ORDER',        label: 'Court Order'        },
    { value: 'OTHER',              label: 'Other'              },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private refundService: RefundService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.refundService.getById(id).subscribe({
      next: (r) => {
        if (r.status !== 'INFO_REQUESTED') {
          this.router.navigate(['/refunds', id, 'view']);
          return;
        }
        this.refund = r;
        this.loading = false;
      },
      error: () => { this.errorMsg = 'Could not load refund.'; this.loading = false; },
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 20 * 1024 * 1024) { this.uploadError = 'Max 20 MB.'; return; }
    this.uploadError = '';
    this.uploadedFiles.push({
      file, type: this.selectedDocType,
      name: file.name, size: this.formatFileSize(file.size),
    });
    input.value = '';
  }

  removeFile(i: number): void { this.uploadedFiles.splice(i, 1); }

  formatFileSize(bytes: number): string {
    return bytes > 1048576
      ? (bytes / 1048576).toFixed(1) + ' MB'
      : (bytes / 1024).toFixed(0) + ' KB';
  }

  getDocTypeLabel(v: string): string {
    return this.documentTypes.find(d => d.value === v)?.label ?? v;
  }

  get canSubmit(): boolean {
    return this.responseText.trim().length >= 10;
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.submitting = true;
    this.errorMsg   = '';

    this.refundService.respond(this.refund!.id, { responseText: this.responseText }).subscribe({
      next: () => {
        this.uploadDocsThenRedirect(0);
      },
      error: () => {
        this.submitting = false;
        this.errorMsg = 'Failed to submit response. Please try again.';
      },
    });
  }

  private uploadDocsThenRedirect(idx: number): void {
    if (idx >= this.uploadedFiles.length) {
      this.router.navigate(['/refunds', this.refund!.id, 'view']);
      return;
    }
    const f = this.uploadedFiles[idx];
    this.refundService.uploadDocument(this.refund!.id, f.file, f.type).subscribe({
      next: () => this.uploadDocsThenRedirect(idx + 1),
      error: () => this.uploadDocsThenRedirect(idx + 1),
    });
  }

  cancel(): void { this.router.navigate(['/refunds', this.refund?.id, 'view']); }
}
