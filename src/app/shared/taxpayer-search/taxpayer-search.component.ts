import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil,
} from 'rxjs/operators';
import { Taxpayer } from '../../models/taxpayer.model';
import { ToastService } from '../toast/toast.service';
import { API_ENDPOINTS } from '../../core/constants/api.constants';

@Component({
  selector: 'app-taxpayer-search',
  templateUrl: './taxpayer-search.component.html',
  styleUrls: ['./taxpayer-search.component.css'],
})
export class TaxpayerSearchComponent implements OnInit, OnDestroy {
  @Input() selectedTaxpayer: Taxpayer | null = null;

  @Output() taxpayerSelected = new EventEmitter<Taxpayer>();

  @Output() taxpayerCleared = new EventEmitter<void>();

  searchQuery = '';
  isSearching = false;
  searchResults: Taxpayer[] = [];
  showResults = false;
  hasSearched = false;

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

  get isLocked(): boolean {
    return this.selectedTaxpayer !== null;
  }

  get displayName(): string {
    return this.getDisplayName(this.selectedTaxpayer);
  }

  getDisplayName(tp: Taxpayer | null): string {
    if (!tp) return '';
    const type = tp.taxpayerType?.typeName?.toLowerCase() ?? '';
    return type.includes('company')
      ? (tp.companyName ?? 'Unknown Company')
      : (tp.fullName ?? 'Unknown');
  }

  onInputChange(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.showResults = false;
      this.hasSearched = false;
    }
  }

  onSearch(): void {
    const q = this.searchQuery.trim();

    if (!q) {
      this.toast.warning('Enter a TIN number, NID, or name to search.');
      return;
    }
    if (q.length < 3) {
      this.toast.warning('Enter at least 3 characters.');
      return;
    }

    this.isSearching = true;
    this.showResults = false;
    this.hasSearched = false;

    this.http
      .get<Taxpayer[]>(
        `${API_ENDPOINTS.TAXPAYERS.LIST}?search=${encodeURIComponent(q)}`,
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSearching = false)),
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results;
          this.showResults = true;
          this.hasSearched = true;
          if (results.length === 0) {
            this.toast.info(
              'No taxpayer found. Check the TIN, NID, or name and try again.',
            );
          }
        },
        // 400/network errors are handled by ErrorInterceptor — no duplicate toast here.
        error: () => {},
      });
  }

  onSelect(tp: Taxpayer): void {
    this.showResults = false;
    this.taxpayerSelected.emit(tp);
  }

  onClear(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
    this.hasSearched = false;
    this.taxpayerCleared.emit();
  }

  isIneligible(tp: Taxpayer): boolean {
    return tp.status === 'Suspended';
  }
}
