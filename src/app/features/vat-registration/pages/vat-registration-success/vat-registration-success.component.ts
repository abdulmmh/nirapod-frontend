import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { VatRegistration } from '../../../../models/vat-registration.model';

@Component({
  selector: 'app-vat-registration-success',
  templateUrl: './vat-registration-success.component.html',
  styleUrls: ['./vat-registration-success.component.css'],
})
export class VatRegistrationSuccessComponent implements OnInit {

  registration: VatRegistration | null = null;

  /** Toggled true on init — triggers the CSS fade-in + slide-up animation. */
  animateIn = false;

  /** Clipboard feedback flag — resets to false after 2 seconds. */
  binCopied = false;

  constructor(private router: Router, private route: ActivatedRoute) {}

  // ── Lifecycle ───────────────────────────────────────────────────────────

  ngOnInit(): void {
    /**
     * Angular passes router state via history.state.
     * history.state survives the navigation but is lost on a hard refresh,
     * which is intentional — the success page is a one-time confirmation view.
     * If the officer refreshes or navigates directly to /success, we redirect
     * them to the list rather than showing an empty or broken page.
     */
    this.registration = (history.state as any)['registration'] ?? null;

    if (!this.registration) {
      this.router.navigate(['/vat-registration']);
      return;
    }

    // Defer one tick so Angular renders the base template first,
    // then applies .animate-in to trigger the CSS transition.
    setTimeout(() => (this.animateIn = true), 50);
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
    } catch { /* silent — clipboard unavailable */ }
    document.body.removeChild(el);
  }

  private flashCopied(): void {
    this.binCopied = true;
    setTimeout(() => (this.binCopied = false), 2000);
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