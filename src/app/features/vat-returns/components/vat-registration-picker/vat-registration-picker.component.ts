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

@Component({
  selector: 'app-vat-registration-picker',
  templateUrl: './vat-registration-picker.component.html',
  styleUrls: ['./vat-registration-picker.component.css'],
})
export class VatRegistrationPickerComponent implements OnInit, OnDestroy {

  /**
   * Sends the selected active VAT registration to the parent return form.
   * Result: the parent can enable or populate the VAT return details.
   */
  @Output() registrationSelected = new EventEmitter<VatRegistration>();

  /**
   * Tells the parent that no VAT registration is selected anymore.
   * Result: the parent can reset any return data tied to the old selection.
   */
  @Output() registrationCleared = new EventEmitter<void>();

  // Search state: controls the search input, loading spinner, and results list.
  searchQuery   = '';
  isSearching   = false;
  hasSearched   = false;
  searchResults : VatRegistration[] = [];

  // Selection state: stores the registration currently shown as selected.
  selectedReg: VatRegistration | null = null;

  // Stops active HTTP subscriptions when this component is destroyed.
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

  // Computed helpers

  // Result is true after a registration is selected, so the selected card can show.
  get isSelected(): boolean { return this.selectedReg !== null; }

  // Search

  /**
   * Clears old results when the user empties the search box.
   * Result: the UI returns to its initial "no search yet" state.
   */
  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.hasSearched   = false;
    }
  }

  /**
   * Searches VAT registrations by BIN, TIN, or business name.
   * Result: only Active registrations are shown because only they can file returns.
   */
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

    // Show a loading state and clear stale results before the new request starts.
    this.isSearching  = true;
    this.hasSearched  = false;
    this.searchResults = [];

    this.http
      .get<VatRegistration[]>(
        `${API_ENDPOINTS.VAT_REGISTRATIONS.LIST}?search=${encodeURIComponent(q)}`
      )
      .pipe(
        // If the user leaves this component, cancel the pending response safely.
        takeUntil(this.destroy$),
        finalize(() => (this.isSearching = false))
      )
      .subscribe({
        next: (data) => {
          // Result shown to the user: only active businesses appear in the list.
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

  // Selection

  /**
   * Stores the chosen registration and sends it to the parent component.
   * Result: search results disappear and the return form can continue below.
   */
  select(reg: VatRegistration): void {
    this.selectedReg   = reg;
    this.searchResults = [];
    this.hasSearched   = false;
    this.searchQuery   = '';

    this.registrationSelected.emit(reg);
    this.toast.success(`"${reg.businessName}" selected. Fill in the return details below.`);
  }

  /**
   * Removes the current selection and tells the parent to clear related return data.
   * Result: the user can search again and choose another business.
   */
  clear(): void {
    this.selectedReg   = null;
    this.searchQuery   = '';
    this.searchResults = [];
    this.hasSearched   = false;

    this.registrationCleared.emit();
    this.toast.info('Registration cleared. Search again to select a business.');
  }
}
