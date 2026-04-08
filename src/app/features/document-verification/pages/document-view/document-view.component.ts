import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Document } from '../../../../models/document.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.css']
})
export class DocumentViewComponent implements OnInit {

  document: Document | null = null;
  isLoading = true;
  documentId : number | null = null;


  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const rawId   = this.route.snapshot.paramMap.get('id');
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
  
      this.http.get<Document>(API_ENDPOINTS.DOCUMENTS.GET(this.documentId!))
        .pipe(takeUntil(this.destroy$),
         finalize  (() => this.isLoading = false)) // FIX #3: Auto-cancel on destroy
        .subscribe({
          next: data => {
            this.document  = data;
          

          // WARNING: expired documents
          if (data.expiryDate && this.isExpired(data.expiryDate)) {
            this.toast.warning('This document has expired.');
          }

          // WARNING: expiring soon documents
          if (data.expiryDate && this.isExpiringSoon(data.expiryDate)) {
            this.toast.warning('This document is expiring soon.');
          }

          // INFO: suspended or dissolved status
          if (data.status === 'Pending' || data.status === 'Rejected' || data.status === 'Under Review') {
            this.toast.info(`This document is currently ${data.status}.`);
          }
        },
          // FIX #1: Removed fake fallback array entirely — show a real error instead
          error: (error) => {
            console.error('Failed to load document details', error);
            this.toast.error('Failed to load document details. Please go back and try again.');
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

  isExpiringSoon(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }

  onEdit(): void { 
    if (!this.document?.id) return;
    this.router.navigate(['/documents', this.document?.id, 'edit']); 
  }
  onBack(): void { 
    this.router.navigate(['/documents']); 
  }
}