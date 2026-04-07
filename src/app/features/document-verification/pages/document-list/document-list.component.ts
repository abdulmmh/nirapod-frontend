import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Document } from '../../../../models/document.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {

  documents: Document[] = [];
  searchTerm = '';
  isLoading  = false;

  errorMsg   = ''; 

  private destroy$ = new Subject<void>(); 

  showDeleteModal   = false;
  pendingDeleteId: number | null = null;

  // private fallback: Document[] = [
  //   {
  //     id: 1, documentNo: 'DOC-2024-00001',
  //     tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
  //     documentType: 'Trade License', documentCategory: 'Business',
  //     documentTitle: 'Trade License 2024', referenceNo: 'TL-44821',
  //     issueDate: '2024-01-01', expiryDate: '2024-12-31',
  //     submissionDate: '2024-01-10', verificationDate: '2024-01-12',
  //     fileSize: '2.4 MB', status: 'Verified',
  //     verifiedBy: 'Tax Officer', remarks: ''
  //   },
  //   {
  //     id: 2, documentNo: 'DOC-2024-00002',
  //     tinNumber: 'TIN-1002', taxpayerName: 'Karim Traders',
  //     documentType: 'TIN Certificate', documentCategory: 'Taxpayer',
  //     documentTitle: 'TIN Certificate', referenceNo: 'TIN-1002',
  //     issueDate: '2023-06-15', expiryDate: '',
  //     submissionDate: '2024-02-01', verificationDate: '',
  //     fileSize: '1.1 MB', status: 'Pending',
  //     verifiedBy: '', remarks: 'Awaiting verification'
  //   },
  //   {
  //     id: 3, documentNo: 'DOC-2024-00003',
  //     tinNumber: 'TIN-1003', taxpayerName: 'Dhaka Pharma Co.',
  //     documentType: 'Audit Report', documentCategory: 'Legal',
  //     documentTitle: 'Annual Audit Report 2023', referenceNo: 'AUD-2024-00001',
  //     issueDate: '2024-02-15', expiryDate: '',
  //     submissionDate: '2024-02-20', verificationDate: '2024-02-22',
  //     fileSize: '5.8 MB', status: 'Under Review',
  //     verifiedBy: 'Auditor Rahim', remarks: 'Under detailed review'
  //   },
  //   {
  //     id: 4, documentNo: 'DOC-2024-00004',
  //     tinNumber: 'TIN-1004', taxpayerName: 'Chittagong Exports',
  //     documentType: 'BIN Certificate', documentCategory: 'Business',
  //     documentTitle: 'BIN Certificate 2024', referenceNo: 'BIN-2024-00004',
  //     issueDate: '2024-01-20', expiryDate: '2029-01-20',
  //     submissionDate: '2024-02-25', verificationDate: '2024-02-26',
  //     fileSize: '0.8 MB', status: 'Verified',
  //     verifiedBy: 'Tax Officer', remarks: ''
  //   },
  //   {
  //     id: 5, documentNo: 'DOC-2024-00005',
  //     tinNumber: 'TIN-1005', taxpayerName: 'Sylhet Tea House',
  //     documentType: 'Bank Statement', documentCategory: 'Payment',
  //     documentTitle: 'Bank Statement Jan-Dec 2023', referenceNo: 'BS-2023-001',
  //     issueDate: '2024-01-05', expiryDate: '',
  //     submissionDate: '2024-03-01', verificationDate: '',
  //     fileSize: '3.2 MB', status: 'Rejected',
  //     verifiedBy: 'Tax Officer', remarks: 'Incomplete — missing months'
  //   },
  //   {
  //     id: 6, documentNo: 'DOC-2024-00006',
  //     tinNumber: 'TIN-1006', taxpayerName: 'BD Tech Solutions',
  //     documentType: 'NID', documentCategory: 'Taxpayer',
  //     documentTitle: 'National ID Card', referenceNo: 'NID-4455667788990',
  //     issueDate: '2020-05-10', expiryDate: '2030-05-10',
  //     submissionDate: '2024-03-10', verificationDate: '2024-03-11',
  //     fileSize: '0.5 MB', status: 'Verified',
  //     verifiedBy: 'Data Entry Operator', remarks: ''
  //   },
  // ];

  constructor(private http: HttpClient, private router: Router) {}

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
    this.errorMsg  = '';

    this.http.get<Document[]>(API_ENDPOINTS.DOCUMENTS.LIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.documents = data;
          this.isLoading = false;
        },
        error: () => {
          this.errorMsg = 'Failed to load documents. Please refresh the page.';
          this.isLoading = false;
        }
      });
  }

  get filteredDocuments(): Document[] {
    if (!this.searchTerm.trim()) return this.documents;
    const term = this.searchTerm.toLowerCase();
    return this.documents.filter(d =>
      d.documentNo.toLowerCase().includes(term)      ||
      d.taxpayerName.toLowerCase().includes(term)    ||
      d.tinNumber.toLowerCase().includes(term)       ||
      d.documentType.toLowerCase().includes(term)    ||
      d.documentTitle.toLowerCase().includes(term)   ||
      d.referenceNo.toLowerCase().includes(term)
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending':      'status-pending',
      'Verified':     'status-active',
      'Rejected':     'status-suspended',
      'Expired':      'status-expired',
      'Under Review': 'status-review'
    };
    return map[status] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'NID':                'type-nid',
      'Trade License':      'type-trade',
      'TIN Certificate':    'type-tin',
      'BIN Certificate':    'type-bin',
      'VAT Return':         'type-vat',
      'Income Tax Return':  'type-it',
      'Bank Statement':     'type-bank',
      'Audit Report':       'type-audit',
      'Other':              'type-other'
    };
    return map[type] ?? '';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'NID':                'bi bi-person-badge-fill',
      'Trade License':      'bi bi-building-fill',
      'TIN Certificate':    'bi bi-upc-scan',
      'BIN Certificate':    'bi bi-file-earmark-text-fill',
      'VAT Return':         'bi bi-arrow-repeat',
      'Income Tax Return':  'bi bi-receipt-cutoff',
      'Bank Statement':     'bi bi-bank2',
      'Audit Report':       'bi bi-shield-fill-check',
      'Other':              'bi bi-file-earmark-fill'
    };
    return map[type] ?? 'bi bi-file-earmark-fill';
  }

  viewDocument(id: number): void   { this.router.navigate(['/documents', id]); }
  editDocument(id: number): void   { this.router.navigate(['/documents', id, 'edit']); }


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
    this.showDeleteModal  = false;
    this.pendingDeleteId  = null;
    this.errorMsg         = '';

    this.http.delete(API_ENDPOINTS.DOCUMENTS.DELETE(id))
      .pipe(takeUntil(this.destroy$)) // FIX #3: Auto-cancel on destroy
      .subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== id);
        },
        error: () => {
          this.errorMsg = 'Failed to delete document. Please try again.';
        }
      });
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }
}