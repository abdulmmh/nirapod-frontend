import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VatRegistration } from '../../../../models/vat-registration.model';

@Component({
  selector: 'app-vat-registration-success',
  templateUrl: './vat-registration-success.component.html',
  styleUrls: ['./vat-registration-success.component.css'],
})
export class VatRegistrationSuccessComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  registration: VatRegistration | null = null;

  animateIn = false;

  binCopied = false;

  constructor(private router: Router, private route: ActivatedRoute) {}

  // ── Lifecycle ───────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.registration = (history.state as any)['registration'] ?? null;

    if (!this.registration) {
      this.router.navigate(['/vat-registration']);
      return;
    }

    timer(50).pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.animateIn = true));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── BIN copy ────────────────────────────────────────────────────────────

  copyBin(): void {
    const bin = this.registration?.binNo;
    if (!bin) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(bin)
        .then(() => this.flashCopied())
        .catch(() => this.fallbackCopy(bin));
    } else {
      this.fallbackCopy(bin);
    }
  }

  private fallbackCopy(text: string): void {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity  = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand('copy');
      this.flashCopied();
    } catch {}
    document.body.removeChild(el);
  }

  private flashCopied(): void {
    this.binCopied = true;
    timer(2000).pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.binCopied = false));
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  goToView(): void {
    this.router.navigate(['view', this.registration?.id], {
      relativeTo: this.route
    });
  }

  registerAnother(): void {
    this.router.navigate(['/../create'], {
      relativeTo: this.route
    });
  }

  printPage(): void { window.print(); }

  // ── Display helpers ──────────────────────────────────────────────────────

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      'Standard':   'cat-standard',
      'Zero Rated': 'cat-zero',
      'Exempt':     'cat-exempt',
      'Special':    'cat-special',
    };
    return map[category] ?? '';
  }

  formatCurrency(amount: number): string {
    if (!amount) return '৳0';
    if (amount >= 100_000) return `৳${(amount / 100_000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }
}
