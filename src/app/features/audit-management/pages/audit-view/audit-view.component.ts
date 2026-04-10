import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Audit } from '../../../../models/audit.model';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-audit-view',
  templateUrl: './audit-view.component.html',
  styleUrls: ['./audit-view.component.css']
})
export class AuditViewComponent implements OnInit {

  // ────────────────── State ──────────────────────

  audit: Audit | null = null;
  auditId: number | null = null;
  isLoading = true;

  private destroy$ = new Subject<void>();
  
  // ──────────────────── Constructor ───────────────────────

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}



  // ────────────────────── Lifecycle ──────────────────────

  ngOnInit(): void {
    this.initializeAudit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

 // ────────────────────── Initialization  ─────────────────────


 private initializeAudit(): void {
    const id = this.getValidAuditId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.auditId = id;
    this.fetchAudit();
  }

  private getValidAuditId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.toast.error('Invalid audit ID. Please go back and try again.');
    
  }


  // ───────────────────────  Data Fetching ────────────────

  private fetchAudit(): void {
    this.isLoading = true;

    this.http.get<Audit>(`${API_ENDPOINTS.AUDITS}/${this.auditId}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Audit): void {
    this.audit = data;
  }

  private handleFetchError(error: unknown): void {
    console.error('Failed to load audit details', error);
    this.toast.error('Failed to load audit details. Please go back and try again.');
  }

 // ───────────────────── Navigation ────────────────────────

  onEdit(): void { this.router.navigate(['/audits', this.audit?.id, 'edit']); }
  onBack(): void { this.router.navigate(['/audits']); }


  // ─────────────────────  UI Helpers  ───────────────────────

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Scheduled': 'status-scheduled', 'In Progress': 'status-progress',
      'Completed': 'status-active', 'Flagged': 'status-flagged',
      'Cancelled': 'status-inactive', 'Pending': 'status-pending'
    };
    return map[s] ?? '';
  }

  getPriorityClass(p: string): string {
    const map: Record<string, string> = {
      'Low': 'pri-low', 'Medium': 'pri-medium',
      'High': 'pri-high', 'Critical': 'pri-critical'
    };
    return map[p] ?? '';
  }

  fmt(amount: number): string {
    if (amount === 0) return '—';
    return `৳${amount.toLocaleString()}`;
  }

}