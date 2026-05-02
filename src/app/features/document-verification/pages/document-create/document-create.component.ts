import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { DocumentCreateRequest } from '../../../../models/document.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.css'],
})
export class DocumentCreateComponent {
  isLoading = false;

  // Taxpayer search
  searchQuery = '';
  isSearching = false;
  searchResults: Taxpayer[] = [];
  selectedTaxpayer: Taxpayer | null = null;
  showResults = false;

  form: DocumentCreateRequest = this.getEmptyForm();

  documentTypes = [
    'NID',
    'Trade License',
    'TIN Certificate',
    'BIN Certificate',
    'VAT Return',
    'Income Tax Return',
    'Bank Statement',
    'Audit Report',
    'Other',
  ];

  documentCategories = [
    'Taxpayer',
    'Business',
    'Return',
    'Payment',
    'Legal',
    'Other',
  ];

  private destroy$ = new Subject<void>();

  private getEmptyForm(): DocumentCreateRequest {
    return {
      taxpayerId: null,
      documentType: '',
      documentCategory: '',
      documentTitle: '',
      referenceNo: '',
      issueDate: '',
      expiryDate: '',
      submissionDate: new Date().toISOString().split('T')[0],
      remarks: '',
    };
  }

  isFormValid(): boolean {
    return !!(
      this.selectedTaxpayer !== null &&
      this.form.documentType &&
      this.form.documentCategory &&
      this.form.documentTitle &&
      this.form.issueDate &&
      this.form.submissionDate
    );
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.warning(
        'Please fill in all required fields with valid values.',
      );
      return;
    }

    this.isLoading = true;

    this.http
      .post(API_ENDPOINTS.DOCUMENTS.CREATE, this.form)
      .pipe(takeUntil(this.destroy$),
        finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.toast.success('Document submitted successfully!');
          setTimeout(() => this.router.navigate(['/documents']), 1500);
        },
        error: (error) => {
          console.error('Error submitting document:', error); 
          this.toast.error('Failed to submit document. Please try again.');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onReset(): void {
    this.form = this.getEmptyForm();
    this.toast.info('Form has been reset.');
  }

  onCancel(): void {
    this.router.navigate(['/documents']);
  }

  // ── Taxpayer Search ──────────────────────────────────────────────────────
  searchTaxpayer(): void {
    const q = this.searchQuery.trim();
    if (!q || q.length < 3) { this.toast.warning('Enter at least 3 characters.'); return; }
    this.isSearching = true;
    this.http.get<Taxpayer[]>(API_ENDPOINTS.TAXPAYERS.LIST + '?search=' + encodeURIComponent(q))
      .pipe(takeUntil(this.destroy$), finalize(() => this.isSearching = false))
      .subscribe({ next: d => { this.searchResults = d; this.showResults = true; }, error: () => this.toast.error('Search failed.') });
  }

  selectTaxpayer(t: Taxpayer): void {
    this.selectedTaxpayer = t;
    this.form.taxpayerId = t.id ?? null;
    this.showResults = false;
    const name = t.taxpayerType?.typeName?.toLowerCase().includes('company') ? t.companyName : t.fullName;
    this.toast.success(`Taxpayer "${name}" selected.`);
  }

  clearTaxpayer(): void {
    this.selectedTaxpayer = null;
    this.form.taxpayerId = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.showResults = false;
  }

  getDisplayName(t: Taxpayer): string {
    return t.taxpayerType?.typeName?.toLowerCase().includes('company')
      ? (t.companyName || '') : (t.fullName || '');
  }
}
