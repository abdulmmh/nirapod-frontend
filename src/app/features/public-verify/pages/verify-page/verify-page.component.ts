// verify-page.component.ts
import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { PublicVerifyResult } from 'src/app/features/certificate-management/models/certificate.model';
import { CertificateService } from '../../../certificate-management/services/certificate.service';


@Component({
  selector: 'app-verify-page',
  templateUrl: './verify-page.component.html',
  styleUrls: ['./verify-page.component.css']
})
export class VerifyPageComponent {

  certNo    = '';
  isLoading = false;
  result: PublicVerifyResult | null = null;
  searched  = false;

  constructor(private certService: CertificateService) {}

  onVerify(): void {
    const trimmed = this.certNo.trim();
    if (!trimmed) return;

    this.isLoading = true;
    this.result    = null;
    this.searched  = false;

    this.certService.publicVerify(trimmed)
      .pipe(finalize(() => { this.isLoading = false; this.searched = true; }))
      .subscribe({
        next:  (res) => this.result = res,
        error: ()    => this.result = { valid: false, message: 'Verification service unavailable.' }
      });
  }

  onClear(): void {
    this.certNo   = '';
    this.result   = null;
    this.searched = false;
  }
}
