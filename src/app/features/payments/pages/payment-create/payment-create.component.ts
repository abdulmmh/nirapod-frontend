import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { PaymentCreateRequest, OutstandingItem } from '../../../../models/payment.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Role } from 'src/app/core/constants/roles.constants';

@Component({
  selector: 'app-payment-create',
  templateUrl: './payment-create.component.html',
  styleUrls: ['./payment-create.component.css']
})
export class PaymentCreateComponent implements OnInit, OnDestroy {

  isLoading = false;
  private destroy$ = new Subject<void>();

  // ── Taxpayer Search ──
  searchQuery       = '';
  isSearching       = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults       = false;
  hasSearched       = false;

  // ── Dropdown Options ──
  paymentTypes   = ['VAT', 'Income Tax', 'Penalty', 'Other'];
  paymentMethods = ['Bank Transfer', 'Online Banking', 'Cheque', 'Cash', 'Mobile Banking'];
  banks = [
    'Sonali Bank', 'Agrani Bank', 'Janata Bank', 'Rupali Bank',
    'Dutch-Bangla Bank', 'BRAC Bank', 'Islami Bank', 'Prime Bank',
    'Eastern Bank', 'Mercantile Bank', 'bKash', 'Nagad', 'Rocket', 'Other'
  ];

  form: PaymentCreateRequest = this.getEmptyForm();

  // ── Outstanding Dues ─────────────────────────────────────────────────────────
  outstandingItems: OutstandingItem[] = [];
  isLoadingOutstanding = false;
  selectedOutstandingItem: OutstandingItem | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.userRole === Role.TAXPAYER) {
      this.loadOwnTaxpayerRecord();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }




  // Load Initial Data


  /**
   * TAXPAYER role এর জন্য নিজের taxpayer profile load করে।
   *
   * NOTE: আগে এটা `GET /api/taxpayers?search=<email>` call করত — কিন্তু
   * সেই endpoint এ TAXPAYER role এর access নেই (officer-only search),
   * তাই AuthorizationDeniedException → 500 হত এবং পুরো form ভেঙে যেত।
   *
   * এখন `GET /api/taxpayers/me` call করে — এটা backend এ JWT থেকে
   * taxpayer resolve করে, single Taxpayer object রিটার্ন করে।
   * (backend এ এই endpoint যোগ করতে হবে — TaxpayerController এ)
   */
  private loadOwnTaxpayerRecord(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) return;

    this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.ME)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.selectTaxpayer(data);
          } else {
            this.toast.error('Your taxpayer profile was not found. Contact your tax officer.');
          }
        },
        error: () => this.toast.error('Failed to load your profile. Please try again.')
      });
  }

  // ── Getters ──

  get isAutoFilled(): boolean {
    return this.selectedTaxpayer !== null;
  }

  /** True once an outstanding item has been picked — locks Payment Type + Return No. */
  get isObligationLocked(): boolean {
    return this.selectedOutstandingItem !== null;
  }

  /** Officers/admins search for a taxpayer; taxpayers only see their own profile. */
  get isOfficerView(): boolean {
    return this.authService.userRole !== Role.TAXPAYER;
  }

  get showChequeField(): boolean {
    return this.form.paymentMethod === 'Cheque';
  }

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    const type = tp.taxpayerType?.typeName?.toLowerCase() || '';
    return type.includes('company')
      ? (tp.companyName || 'Unknown Company')
      : (tp.fullName || 'Unknown Individual');
  }

  // ── Taxpayer Search ──

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults   = false;
      this.hasSearched   = false;
    }
  }

  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.toast.warning('Enter TIN number, NID or taxpayer name to search.');
      return;
    }
    if (q.length < 3) {
      this.toast.warning('Enter at least 3 characters to search.');
      return;
    }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    const url = `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`;
    this.http.get<Taxpayer[]>(url)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSearching = false)))
      .subscribe({
        next: (data) => {
          this.searchResults = data;
          this.showResults   = true;
          this.hasSearched   = true;
          if (data.length === 0) {
            this.toast.info('No taxpayer found. Check TIN, NID or name and try again.');
          }
        },
        error: () => this.toast.error('Search failed. Please try again.')
      });
  }

  selectTaxpayer(taxpayer: Taxpayer): void {
    if (!taxpayer.tinNumber) {
      this.toast.error('This taxpayer does not have a TIN yet. Issue a TIN first.');
      this.showResults = false;
      return;
    }

    this.selectedTaxpayer  = taxpayer;
    this.showResults       = false;
    this.form.taxpayerId   = taxpayer.id;
    this.form.tinNumber    = taxpayer.tinNumber || '';
    this.form.taxpayerName = this.getDisplayName(taxpayer);

    this.toast.success(`"${this.form.taxpayerName}" auto-filled.`);

    // Fetch this taxpayer's outstanding VAT/ITR/Penalty dues
    this.loadOutstandingItems();
  }

  clearTaxpayer(): void {
    this.selectedTaxpayer  = null;
    this.searchQuery       = '';
    this.searchResults     = [];
    this.showResults       = false;
    this.hasSearched       = false;
    this.form.taxpayerId   = undefined;
    this.form.tinNumber    = '';
    this.form.taxpayerName = '';

    this.outstandingItems        = [];
    this.selectedOutstandingItem = null;

    this.toast.info('Taxpayer cleared.');
  }

  // ── Outstanding Dues ──────────────────────────────────────────────────────

  private loadOutstandingItems(): void {
    if (!this.form.taxpayerId) return;

    this.isLoadingOutstanding = true;
    this.outstandingItems     = [];

    this.http.get<OutstandingItem[]>(API_ENDPOINTS.PAYMENTS.OUTSTANDING(this.form.taxpayerId))
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoadingOutstanding = false)))
      .subscribe({
        next:  (items) => { this.outstandingItems = items ?? []; },
        error: () => { this.outstandingItems = []; }
      });
  }

  /** User picks an item from the Outstanding Dues list — auto-fills the form, list collapses. */
  selectOutstandingItem(item: OutstandingItem): void {
    this.selectedOutstandingItem = item;
    this.form.paymentType = item.type;
    this.form.returnNo    = item.returnNo;
    this.form.amount      = item.outstanding;   // editable — supports partial payment
  }

  /** "Change" — collapses back to the full list, unlocks Payment Type + Return No. Values are kept. */
  clearOutstandingSelection(): void {
    this.selectedOutstandingItem = null;
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VAT':        'oi-type-vat',
      'Income Tax': 'oi-type-it',
      'Penalty':    'oi-type-penalty'
    };
    return map[type] ?? 'oi-type-other';
  }

  formatAmount(v: number): string {
    if (!v) return '৳0';
    if (v >= 100_000) return `৳${(v / 100_000).toFixed(2)}L`;
    return `৳${v.toLocaleString('en-BD')}`;
  }

  // ── Validation ──

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber     &&
      this.form.taxpayerName  &&
      this.form.paymentType   &&
      this.form.paymentMethod &&
      this.form.amount > 0    &&
      this.form.bankName      &&
      this.form.paymentDate
    );
  }

  // ── Submit ──

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;

    this.http.post(API_ENDPOINTS.PAYMENTS.CREATE, this.form)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.toast.success('Payment recorded successfully!');
          timer(1500)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.router.navigate(['..'],
              { relativeTo: this.route }
            ));
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to record payment. Please try again.';
          this.toast.error(msg);
        }
      });
  }

  onReset(): void {
    this.form             = this.getEmptyForm();
    this.selectedTaxpayer = null;
    this.searchQuery      = '';
    this.searchResults    = [];
    this.showResults      = false;
    this.hasSearched      = false;

    this.outstandingItems        = [];
    this.selectedOutstandingItem = null;

    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['..'], {
        relativeTo: this.route
      });
    }
  }

  private getEmptyForm(): PaymentCreateRequest {
    return {
      taxpayerId:    undefined,
      tinNumber:     '',
      taxpayerName:  '',
      paymentType:   '',
      paymentMethod: '',
      amount:        0,
      bankName:      '',
      bankBranch:    '',
      accountNo:     '',
      chequeNo:      '',
      paymentDate:   new Date().toISOString().split('T')[0],
      valueDate:     new Date().toISOString().split('T')[0],
      referenceNo:   '',
      returnNo:      '',
      remarks:       ''
    };
  }
}