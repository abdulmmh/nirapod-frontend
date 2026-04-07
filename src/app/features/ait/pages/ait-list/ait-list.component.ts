import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ait } from '../../../../models/ait.model';
import { Subject, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ait-list',
  templateUrl: './ait-list.component.html',
  styleUrls: ['./ait-list.component.css']
})
export class AitListComponent implements OnInit {

  records: Ait[] = [];
  searchTerm = '';
  isLoading  = false;

  errorMsg = '';

  private destroy$ = new Subject<void>();

  showDeleteModal   = false;
  pendingDeleteId: number | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadAits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAits(): void {
    this.http.get<Ait[]>(API_ENDPOINTS.AIT.LIST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.records = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMsg = 'Failed to load AIT records. Please try again.';
        }
      });
  }

  get filtered(): Ait[] {
    if (!this.searchTerm.trim()) return this.records;
    const term = this.searchTerm.toLowerCase();
    return this.records.filter(r =>
      r.aitRef.toLowerCase().includes(term)          ||
      r.taxpayerName.toLowerCase().includes(term)    ||
      r.tinNumber.toLowerCase().includes(term)       ||
      r.sourceType.toLowerCase().includes(term)      ||
      r.deductedBy.toLowerCase().includes(term)
    );
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft', 'Deducted': 'status-pending',
      'Deposited': 'status-active', 'Credited': 'status-credited',
      'Disputed': 'status-suspended'
    };
    return map[s] ?? '';
  }

  getSourceClass(s: string): string {
    const map: Record<string, string> = {
      'Salary': 'src-salary', 'Import': 'src-import',
      'Contract': 'src-contract', 'Interest': 'src-interest',
      'Dividend': 'src-dividend', 'Commission': 'src-commission',
      'Export': 'src-export'
    };
    return map[s] ?? '';
  }

  countByStatus(status: string): number {
    return this.records.filter(r => r.status === status).length;
  }

  formatCurrency(a: number): string {
    if (a >= 100000) return `৳${(a / 100000).toFixed(2)}L`;
    return `৳${a.toLocaleString()}`;
  }

  get totalAIT(): number { return this.records.reduce((s, r) => s + r.aitAmount, 0); }

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

    this.http.delete(API_ENDPOINTS.AIT.DELETE(id))
      .pipe(takeUntil(this.destroy$)) // FIX #3: Auto-cancel on destroy
      .subscribe({
        next: () => {
          this.records = this.records.filter(r => r.id !== id);
        },
        error: () => {
          this.errorMsg = 'Failed to delete AIT record. Please try again.';
        }
      });
  }
  
  isExpired(date: string): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  }

  view(id: number): void { this.router.navigate(['/ait/view', id]); }
  edit(id: number): void { this.router.navigate(['/ait/edit', id]); }
}