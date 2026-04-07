import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Document } from '../../../../models/document.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.css']
})
export class DocumentViewComponent implements OnInit {

  document: Document | null = null;
  isLoading = true;

  errorMsg = '';

  documentId : number | null = null;


  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const rawId   = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.errorMsg  = 'Invalid document ID. Please go back and try again.';
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
      this.isLoading = true;
      this.errorMsg  = '';
  
      this.http.get<Document>(API_ENDPOINTS.DOCUMENTS.GET(this.documentId!))
        .pipe(takeUntil(this.destroy$)) // FIX #3: Auto-cancel on destroy
        .subscribe({
          next: data => {
            this.document  = data;
            this.isLoading = false;
          },
          // FIX #1: Removed fake fallback array entirely — show a real error instead
          error: () => {
            this.isLoading = false;
            this.errorMsg  = 'Failed to load document details. Please go back and try again.';
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

  onEdit(): void { 
    if (!this.document?.id) return;
    this.router.navigate(['/documents', this.document?.id, 'edit']); 
  }
  onBack(): void { 
    this.router.navigate(['/documents']); 
  }
}