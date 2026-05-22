import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Penalty } from '../../../../models/penalty.model';
import { PenaltyService } from '../../services/penalty.service';

@Component({
  selector: 'app-penalty-list',
  templateUrl: './penalty-list.component.html',
  styleUrls: ['./penalty-list.component.css'],
})
export class PenaltyListComponent implements OnInit {
  penalties: Penalty[] = [];
  searchTerm = '';
  isLoading = false;
  showDeleteModal = false;
  pendingDeleteId: number | null = null;


  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private penaltyService: PenaltyService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.penaltyService.getAll().subscribe({
      next: (data) => {
        this.penalties = data;
        this.isLoading = false;
      },
      error: () => {
        // this.penalties = this.fallback;
        this.isLoading = false;
        this.toast.error('Failed to load penalties. Showing sample data.');
      },
    });
  }

  get filteredPenalties(): Penalty[] {
    if (!this.searchTerm.trim()) return this.penalties;
    const term = this.searchTerm.toLowerCase();
    return this.penalties.filter(
      (p) =>
        p.penaltyNo.toLowerCase().includes(term) ||
        p.taxpayerName.toLowerCase().includes(term) ||
        p.tinNumber.toLowerCase().includes(term) ||
        p.penaltyType.toLowerCase().includes(term) ||
        p.assessmentYear.toLowerCase().includes(term),
    );
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Issued: 'status-issued',
      Pending: 'status-pending',
      Paid: 'status-active',
      Waived: 'status-waived',
      Appealed: 'status-appealed',
      Overdue: 'status-overdue',
    };
    return map[status] ?? '';
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      Low: 'sev-low',
      Medium: 'sev-medium',
      High: 'sev-high',
      Critical: 'sev-critical',
    };
    return map[severity] ?? '';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'Late Filing': 'type-late',
      'Late Payment': 'type-late',
      'Non-Compliance': 'type-noncompliance',
      Fraud: 'type-fraud',
      Underpayment: 'type-under',
      Other: 'type-other',
    };
    return map[type] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)}L`;
    return `৳${amount.toLocaleString()}`;
  }

  viewPenalty(id: number): void {
    this.router.navigate(['/penalties', 'view', id]);
  }

  editPenalty(id: number): void {
    this.router.navigate(['/penalties', 'edit', id]);
  }

  confirmDelete(id: number): void {
    this.pendingDeleteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.resetDeleteState();
  }

  confirmDeleteExecute(): void {
    if (this.pendingDeleteId === null) return;
    const id = this.pendingDeleteId;
    this.resetDeleteState();
    this.delete(id);
  }

  private delete(id: number): void {
    this.http.delete(`${API_ENDPOINTS.PENALTIES.LIST}/${id}`).subscribe({
      next: () => {
        this.penalties = this.penalties.filter((p) => p.id !== id);
        this.toast.success('Penalty deleted successfully.');
      },
      error: () => {
        this.penalties = this.penalties.filter((p) => p.id !== id);
        this.toast.warning('Penalty removed locally. Server delete failed.');
      },
    });
  }

  private resetDeleteState(): void {
    this.pendingDeleteId = null;
    this.showDeleteModal = false;
  }
}
