This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: src/app/features/payments/pages/payment-create/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
src/app/features/payments/pages/payment-create/payment-create.component.css
src/app/features/payments/pages/payment-create/payment-create.component.html
src/app/features/payments/pages/payment-create/payment-create.component.spec.ts
src/app/features/payments/pages/payment-create/payment-create.component.ts
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="src/app/features/payments/pages/payment-create/payment-create.component.spec.ts">
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCreateComponent } from './payment-create.component';

describe('PaymentCreateComponent', () => {
  let component: PaymentCreateComponent;
  let fixture: ComponentFixture<PaymentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
</file>

<file path="src/app/features/payments/pages/payment-create/payment-create.component.css">
.section-icon.teal {
  background: linear-gradient(135deg, #1faa8b, #17c69a);
}
.section-icon.orange {
  background: linear-gradient(135deg, #f59e0b, #f97316);
}
.section-icon.purple {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
}
</file>

<file path="src/app/features/payments/pages/payment-create/payment-create.component.html">
<div class="page-header">
  <div class="page-header-left">
    <h4>Record Payment</h4>
    <p>Record a new tax payment transaction.</p>
  </div>
  <button class="btn-back" (click)="onCancel()">
    <i class="bi bi-arrow-left"></i> Back to List
  </button>
</div>

<div class="form-card">

  <!-- Section 0: Find Taxpayer -->
  <div class="form-section">
    <div class="section-header">
      <div class="section-icon search-icon">
        <i class="bi bi-search"></i>
      </div>
      <div>
        <h6 class="section-title">Find Taxpayer</h6>
        <span class="section-sub">Search by TIN number, NID or name — details will auto-fill</span>
      </div>
    </div>

    <div class="search-row">
      <div class="input-wrap search-input-wrap">
        <i class="bi bi-upc-scan input-icon"></i>
        <input type="text" class="form-input"
          placeholder="Enter TIN number, NID or taxpayer name..."
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchInput()"
          (keyup.enter)="searchTaxpayer()"
          [disabled]="isAutoFilled" />
        <button *ngIf="isAutoFilled" class="clear-btn" (click)="clearTaxpayer()">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <button class="btn-search" (click)="searchTaxpayer()" [disabled]="isSearching || isAutoFilled">
        <span *ngIf="!isSearching"><i class="bi bi-search"></i> Search</span>
        <span *ngIf="isSearching"><span class="spinner-border spinner-border-sm"></span> Searching...</span>
      </button>
    </div>

    <!-- Search Results -->
    <div class="search-results" *ngIf="showResults && searchResults.length > 0">
      <div class="result-item" *ngFor="let t of searchResults" (click)="selectTaxpayer(t)">
        <div class="result-avatar"><i class="bi bi-person-fill"></i></div>
        <div class="result-info">
          <span class="result-name">{{ getDisplayName(t) }}</span>
          <span class="result-meta">
            <span *ngIf="t.tinNumber" class="me-2 fw-bold text-primary">TIN: {{ t.tinNumber }}</span>
            <span *ngIf="!t.tinNumber" class="text-danger me-2">No TIN</span>
            <span *ngIf="t.nid">NID: {{ t.nid }}</span>
            <span *ngIf="t.phone"> · {{ t.phone }}</span>
          </span>
        </div>
        <span class="result-badge">Select</span>
      </div>
    </div>

    <!-- No Results -->
    <div class="no-result-note" *ngIf="hasSearched && searchResults.length === 0">
      <i class="bi bi-info-circle"></i> No taxpayer found. Check TIN, NID or name and try again.
    </div>

    <!-- Selected Card -->
    <div class="selected-card" *ngIf="isAutoFilled && selectedTaxpayer">
      <div class="selected-card-left">
        <div class="selected-avatar"><i class="bi bi-person-check-fill"></i></div>
        <div>
          <p class="selected-name">{{ getDisplayName(selectedTaxpayer) }}</p>
          <p class="selected-meta">
            <span *ngIf="selectedTaxpayer.tinNumber">TIN: {{ selectedTaxpayer.tinNumber }}</span>
            <span *ngIf="selectedTaxpayer.phone"> · {{ selectedTaxpayer.phone }}</span>
          </p>
        </div>
      </div>
      <div class="autofill-tag"><i class="bi bi-lightning-charge-fill"></i> Auto-filled</div>
    </div>
  </div>

  <div class="section-divider"></div>

  <!-- Section 1: Taxpayer Info -->
  <div class="form-section">
    <div class="section-header">
      <div class="section-icon">
        <i class="bi bi-person-badge-fill"></i>
      </div>
      <div>
        <h6 class="section-title">Taxpayer Information</h6>
        <span class="section-sub">TIN, name and payment type</span>
      </div>
    </div>

    <div class="form-grid">

      <div class="form-group">
        <label class="form-label required">TIN Number</label>
        <div class="input-wrap" [class.locked]="isAutoFilled">
          <i class="bi bi-upc-scan input-icon"></i>
          <input type="text" class="form-input"
            placeholder="e.g. TIN-000000001"
            [(ngModel)]="form.tinNumber"
            [disabled]="isAutoFilled" />
          <i class="bi bi-lock-fill lock-icon" *ngIf="isAutoFilled"></i>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label required">Taxpayer Name</label>
        <div class="input-wrap" [class.locked]="isAutoFilled">
          <i class="bi bi-person-fill input-icon"></i>
          <input type="text" class="form-input"
            placeholder="Enter taxpayer name"
            [(ngModel)]="form.taxpayerName"
            [disabled]="isAutoFilled" />
          <i class="bi bi-lock-fill lock-icon" *ngIf="isAutoFilled"></i>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label required">Payment Type</label>
        <div class="input-wrap">
          <i class="bi bi-tag-fill input-icon"></i>
          <select class="form-input form-select" [(ngModel)]="form.paymentType">
            <option value="">Select Type</option>
            <option *ngFor="let t of paymentTypes" [value]="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Return / Reference No.</label>
        <div class="input-wrap">
          <i class="bi bi-file-earmark-text input-icon"></i>
          <input type="text" class="form-input"
            placeholder="e.g. ITR-2025-26-XXXXXXXX"
            [(ngModel)]="form.returnNo" />
        </div>
      </div>

    </div>
  </div>

  <div class="section-divider"></div>

  <!-- Section 2: Payment Details -->
  <div class="form-section">
    <div class="section-header">
      <div class="section-icon teal">
        <i class="bi bi-credit-card-fill"></i>
      </div>
      <div>
        <h6 class="section-title">Payment Details</h6>
        <span class="section-sub">Amount, method and transaction info</span>
      </div>
    </div>

    <div class="form-grid">

      <div class="form-group">
        <label class="form-label required">Amount (৳)</label>
        <div class="input-wrap">
          <i class="bi bi-currency-dollar input-icon"></i>
          <input type="number" class="form-input"
            placeholder="0"
            [(ngModel)]="form.amount" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label required">Payment Method</label>
        <div class="input-wrap">
          <i class="bi bi-wallet2 input-icon"></i>
          <select class="form-input form-select" [(ngModel)]="form.paymentMethod">
            <option value="">Select Method</option>
            <option *ngFor="let m of paymentMethods" [value]="m">{{ m }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Reference No.</label>
        <div class="input-wrap">
          <i class="bi bi-hash input-icon"></i>
          <input type="text" class="form-input"
            placeholder="e.g. REF-2024-001"
            [(ngModel)]="form.referenceNo" />
        </div>
      </div>

      <div class="form-group" *ngIf="showChequeField">
        <label class="form-label required">Cheque No.</label>
        <div class="input-wrap">
          <i class="bi bi-journal-text input-icon"></i>
          <input type="text" class="form-input"
            placeholder="e.g. CHQ-889921"
            [(ngModel)]="form.chequeNo" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label required">Payment Date</label>
        <div class="input-wrap">
          <i class="bi bi-calendar3 input-icon"></i>
          <input type="date" class="form-input" [(ngModel)]="form.paymentDate" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Value Date</label>
        <div class="input-wrap">
          <i class="bi bi-calendar-check input-icon"></i>
          <input type="date" class="form-input" [(ngModel)]="form.valueDate" />
        </div>
      </div>

    </div>
  </div>

  <div class="section-divider"></div>

  <!-- Section 3: Bank Details -->
  <div class="form-section">
    <div class="section-header">
      <div class="section-icon orange">
        <i class="bi bi-bank2"></i>
      </div>
      <div>
        <h6 class="section-title">Bank Details</h6>
        <span class="section-sub">Bank, branch and account information</span>
      </div>
    </div>

    <div class="form-grid">

      <div class="form-group">
        <label class="form-label required">Bank Name</label>
        <div class="input-wrap">
          <i class="bi bi-bank input-icon"></i>
          <select class="form-input form-select" [(ngModel)]="form.bankName">
            <option value="">Select Bank</option>
            <option *ngFor="let b of banks" [value]="b">{{ b }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Branch</label>
        <div class="input-wrap">
          <i class="bi bi-geo-alt-fill input-icon"></i>
          <input type="text" class="form-input"
            placeholder="Enter branch name"
            [(ngModel)]="form.bankBranch" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Account No.</label>
        <div class="input-wrap">
          <i class="bi bi-credit-card input-icon"></i>
          <input type="text" class="form-input"
            placeholder="Enter account number"
            [(ngModel)]="form.accountNo" />
        </div>
      </div>

    </div>
  </div>

  <div class="section-divider"></div>

  <!-- Section 4: Remarks -->
  <div class="form-section">
    <div class="section-header">
      <div class="section-icon purple">
        <i class="bi bi-chat-text-fill"></i>
      </div>
      <div>
        <h6 class="section-title">Remarks</h6>
        <span class="section-sub">Optional notes</span>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group full-width">
        <label class="form-label">Remarks / Notes</label>
        <div class="input-wrap">
          <i class="bi bi-pencil-square input-icon textarea-icon"></i>
          <textarea class="form-input form-textarea"
            placeholder="Enter any additional remarks..."
            [(ngModel)]="form.remarks"
            rows="3"></textarea>
        </div>
      </div>
    </div>
  </div>

  <!-- Form Actions -->
  <div class="form-actions">
    <button class="btn-cancel" (click)="onCancel()" [disabled]="isLoading">
      <i class="bi bi-x-lg"></i> Cancel
    </button>
    <button class="btn-reset" (click)="onReset()" [disabled]="isLoading">
      <i class="bi bi-arrow-counterclockwise"></i> Reset
    </button>
    <button class="btn-submit" (click)="onSubmit()"
      [disabled]="isLoading || !isFormValid()">
      <span *ngIf="!isLoading">
        <i class="bi bi-check-lg"></i> Record Payment
      </span>
      <span *ngIf="isLoading">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Saving...
      </span>
    </button>
  </div>

</div>
</file>

<file path="src/app/features/payments/pages/payment-create/payment-create.component.ts">
import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { PaymentCreateRequest } from '../../../../models/payment.model';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from '../../../../shared/toast/toast.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Role } from 'src/app/core/constants/roles.constants';

@Component({
  selector: 'app-payment-create',
  templateUrl: './payment-create.component.html',
  styleUrls: ['./payment-create.component.css']
})
export class PaymentCreateComponent implements OnDestroy {

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


  private loadOwnTaxpayerRecord(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) return;

    const url = `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(currentUser.email)}`;
    this.http.get<Taxpayer[]>(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.selectTaxpayer(data[0]);
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
    this.toast.info('Taxpayer cleared.');
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
</file>

</files>
