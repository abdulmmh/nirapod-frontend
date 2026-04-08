import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Document } from '../../../../models/document.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  searchTerm = '';
  isLoading = false;

  private destroy$ = new Subject<void>();

  showDeleteModal = false;
  pendingDeleteId: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    this.isLoading = true;

    this.http
      .get<Document[]>(API_ENDPOINTS.DOCUMENTS.LIST)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (data) => {
          this.documents = data;
          
          // INFO:
          if (data.length === 0) {
            this.toast.info(
              'No documents registered yet. Click "Register document" to add one.',
            );
          }

          // WARNING:
          const soon = data.filter((b) => this.isExpiringSoon(b.expiryDate));
          if (soon.length > 0) {
            this.toast.warning(
              `${soon.length} item(s) require attention within 30 days.`
            );
          }
          this.toast.success('Documents loaded successfully.');
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.toast.error('Failed to load documents. Please try again later.');
        },
      });
  }

  get filteredDocuments(): Document[] {
    if (!this.searchTerm.trim()) return this.documents;
    const term = this.searchTerm.toLowerCase();
    return this.documents.filter(
      (d) =>
        d.documentNo.toLowerCase().includes(term) ||
        d.taxpayerName.toLowerCase().includes(term) ||
        d.tinNumber.toLowerCase().includes(term) ||
        d.documentType.toLowerCase().includes(term) ||
        d.documentTitle.toLowerCase().includes(term) ||
        d.referenceNo.toLowerCase().includes(term),
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'status-pending',
      Verified: 'status-active',
      Rejected: 'status-suspended',
      Expired: 'status-expired',
      'Under Review': 'status-review',
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      NID: 'type-nid',
      'Trade License': 'type-trade',
      'TIN Certificate': 'type-tin',
      'BIN Certificate': 'type-bin',
      'VAT Return': 'type-vat',
      'Income Tax Return': 'type-it',
      'Bank Statement': 'type-bank',
      'Audit Report': 'type-audit',
      Other: 'type-other',
    };
    return map[type] ?? '';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      NID: 'bi bi-person-badge-fill',
      'Trade License': 'bi bi-building-fill',
      'TIN Certificate': 'bi bi-upc-scan',
      'BIN Certificate': 'bi bi-file-earmark-text-fill',
      'VAT Return': 'bi bi-arrow-repeat',
      'Income Tax Return': 'bi bi-receipt-cutoff',
      'Bank Statement': 'bi bi-bank2',
      'Audit Report': 'bi bi-shield-fill-check',
      Other: 'bi bi-file-earmark-fill',
    };
    return map[type] ?? 'bi bi-file-earmark-fill';
  }

  viewDocument(id: number): void {
    this.router.navigate(['/documents', id]);
  }
  editDocument(id: number): void {
    this.router.navigate(['/documents', id, 'edit']);
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }
  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.showDeleteModal = false;
    this.pendingDeleteId = null;

    this.http
      .delete(API_ENDPOINTS.DOCUMENTS.DELETE(id))
      .pipe(takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })) // FIX #3: Auto-cancel on destroy
      .subscribe({
        next: () => {
          this.documents = this.documents.filter((d) => d.id !== id);
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.toast.error('Failed to delete document. Please try again.');
        },
      });
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

  isExpiringSoon(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }
}
