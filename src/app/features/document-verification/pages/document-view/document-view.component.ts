import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Document } from '../../../../models/document.model';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.css']
})
export class DocumentViewComponent implements OnInit {

  document: Document | null = null;
  isLoading = true;

  private fallback: Document[] = [
    {
      id: 1, documentNo: 'DOC-2024-00001',
      tinNumber: 'TIN-1001', taxpayerName: 'Rahman Textile Ltd.',
      documentType: 'Trade License', documentCategory: 'Business',
      documentTitle: 'Trade License 2024', referenceNo: 'TL-44821',
      issueDate: '2024-01-01', expiryDate: '2024-12-31',
      submissionDate: '2024-01-10', verificationDate: '2024-01-12',
      fileSize: '2.4 MB', status: 'Verified',
      verifiedBy: 'Tax Officer', remarks: ''
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<Document>(API_ENDPOINTS.DOCUMENTS.GET(id)).subscribe({
      next: data => { this.document = data; this.isLoading = false; },
      error: ()  => {
        this.document = this.fallback.find(d => d.id === id) || this.fallback[0];
        this.isLoading = false;
      }
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Pending': 'status-pending', 'Verified': 'status-active',
      'Rejected': 'status-suspended', 'Expired': 'status-expired',
      'Under Review': 'status-review'
    };
    return map[s] ?? '';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'NID': 'bi bi-person-badge-fill', 'Trade License': 'bi bi-building-fill',
      'TIN Certificate': 'bi bi-upc-scan', 'BIN Certificate': 'bi bi-file-earmark-text-fill',
      'VAT Return': 'bi bi-arrow-repeat', 'Income Tax Return': 'bi bi-receipt-cutoff',
      'Bank Statement': 'bi bi-bank2', 'Audit Report': 'bi bi-shield-fill-check',
      'Other': 'bi bi-file-earmark-fill'
    };
    return map[type] ?? 'bi bi-file-earmark-fill';
  }

  isExpired(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  onEdit(): void { this.router.navigate(['/documents', this.document?.id, 'edit']); }
  onBack(): void { this.router.navigate(['/documents']); }
}