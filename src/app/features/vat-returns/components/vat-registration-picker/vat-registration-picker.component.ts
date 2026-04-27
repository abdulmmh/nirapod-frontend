import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { VatRegistration } from '../../../../models/vat-registration.model';
import { ToastService } from '../../../../shared/toast/toast.service';

/**
 * VatRegistrationPickerComponent
 *
 * Responsibilities (only):
 *  - Accept a query string, call the API, filter to Active-only results
 *  - Show results list OR a "selected card + Change button" — never both
 *  - Emit `registrationSelected` when the user picks a record
 *  - Emit `registrationCleared` when the user clicks "Change"
 *
 * The parent (VatReturnCreateComponent) is responsible for patching
 * vatRegistrationId into its own form and storing selectedReg locally.
 */
@Component({
  selector: 'app-vat-registration-picker',
  templateUrl: './vat-registration-picker.component.html',
  styleUrls: ['./vat-registration-picker.component.css'],
})
export class VatRegistrationPickerComponent implements OnInit, OnDestroy {

  /** Fires once when the user clicks a result row. */
  @Output() registrationSelected = new EventEmitter<VatRegistration>();

  /** Fires when the user hits the "Change" button on the selected card. */
  @Output() registrationCleared = new EventEmitter<void>();

  // ── Search state ──────────────────────────────────────────────────────────
  searchQuery   = '';
  isSearching   = false;
  hasSearched   = false;
  searchResults : VatRegistration[] = [];

  // ── Selection state ───────────────────────────────────────────────────────
  /** Set internally after emission so the card renders correctly. */
  selectedReg: VatRegistration | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Computed helpers ──────────────────────────────────────────────────────

  get isSelected(): boolean { return this.selectedReg !== null; }

  // ── Search ────────────────────────────────────────────────────────────────

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.hasSearched   = false;
    }
  }

  search(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.toast.warning('Enter a BIN number, TIN or business name to search.');
      return;
    }
    if (q.length < 3) {
      this.toast.warning('Enter at least 3 characters to search.');
      return;
    }

    this.isSearching  = true;
    this.hasSearched  = false;
    this.searchResults = [];

    this.http
      .get<VatRegistration[]>(
        `${API_ENDPOINTS.VAT_REGISTRATIONS.LIST}?search=${encodeURIComponent(q)}`
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSearching = false))
      )
      .subscribe({
        next: (data) => {
          // Only Active registrations can file returns
          this.searchResults = data.filter((r) => r.status === 'Active');
          this.hasSearched   = true;
          if (this.searchResults.length === 0) {
            this.toast.info(
              'No active VAT registration found. Only Active registrations can file returns.'
            );
          }
        },
        error: () => this.toast.error('Search failed. Please try again.'),
      });
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  select(reg: VatRegistration): void {
    this.selectedReg   = reg;
    this.searchResults = [];    // hide the list immediately
    this.hasSearched   = false;
    this.searchQuery   = '';

    this.registrationSelected.emit(reg);
    this.toast.success(`"${reg.businessName}" selected. Fill in the return details below.`);
  }

  clear(): void {
    this.selectedReg   = null;
    this.searchQuery   = '';
    this.searchResults = [];
    this.hasSearched   = false;

    this.registrationCleared.emit();
    this.toast.info('Registration cleared. Search again to select a business.');
  }
}
