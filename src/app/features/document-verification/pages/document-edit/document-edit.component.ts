import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Document } from '../../../../models/document.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.css'],
})
export class DocumentEditComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  documentId: number | null = null;

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
  statuses = ['Pending', 'Verified', 'Rejected', 'Expired', 'Under Review'];

  form: Partial<Document> = {};

  private destroy$ = new Subject<void>();

  get availableStatuses(): string[] {
    return this.statuses;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.toast.error('Invalid document ID. Please go back and try again.');
      return;
    }
    this.documentId = parsedId;
    this.loadDocument();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocument(): void {
    if (!this.documentId) {
      this.toast.error('Invalid document ID. Please go back and try again.');
      return;
    }

    this.isLoading = true;
    this.http
      .get<Document>(API_ENDPOINTS.DOCUMENTS.GET(this.documentId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.form = { ...data };
        },
        error: (error) => {
          console.error('Error loading document:', error);
          this.toast.error(
            'Failed to load document. Please refresh or go back.',
          );
        },
      });
  }

  isFormValid(): boolean {
    return !!(
      this.form.tinNumber &&
      this.form.taxpayerName &&
      this.form.documentType &&
      this.form.documentCategory &&
      this.form.documentTitle &&
      this.form.issueDate &&
      this.form.submissionDate
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.error('Please fill in all required fields.');
      return;
    }

    if (!this.documentId) {
      this.toast.error('Invalid document ID. Please go back and try again.');
      return;
    }

    this.isSaving = true;


    this.http
      .put(API_ENDPOINTS.DOCUMENTS.UPDATE(this.documentId!), this.form)
      .pipe(takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toast.success('Document updated successfully!');
          setTimeout(() => this.router.navigate(['/documents']), 1500);
        },
        error: (error) => {
          console.error('Error updating document:', error);
          this.toast.error('Failed to update document. Please try again.');
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/documents', this.documentId]);
  }
}
