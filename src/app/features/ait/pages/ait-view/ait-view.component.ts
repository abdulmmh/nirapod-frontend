import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ait } from '../../../../models/ait.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-ait-view',
  templateUrl: './ait-view.component.html',
  styleUrls: ['./ait-view.component.css']
})
export class AitViewComponent implements OnInit {

  // ────────────────── State ──────────────────────
  ait: Ait | null = null;
  aitId: number | null = null;
  isLoading = true;

  private destroy$ = new Subject<void>();

  // ──────────────────── Constructor ───────────────────────

   constructor(
     private route: ActivatedRoute,
     private router: Router,
     private http: HttpClient,
     private toast: ToastService
   ) {}

  // ────────────────────── Lifecycle ──────────────────────

  ngOnInit(): void {
    this.initializeAit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ────────────────────── Initialization  ─────────────────────

  private initializeAit(): void {
    const id = this.getValidAitId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.aitId = id;
    this.fetchAit();
  }

  private getValidAitId(): number | null {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? Number(id) : null;
  }

  private handleInvalidId(): void {
    this.toast.error('Invalid AIT ID');
    this.router.navigate(['/ait']);
  }

  // ───────────────────────  Data Fetching ──────────────────
 
  private fetchAit(): void {
    if (!this.aitId) return;

    this.isLoading = true;
    this.http.get<Ait>(`${API_ENDPOINTS.AITS}/${this.aitId}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (err) => this.handleFetchError(err)
      });
  }

  private handleFetchSuccess(data: Ait): void {
    this.ait = data;
  }

  private handleFetchError(err: unknown): void {
    this.toast.error('Failed to load AIT details');
    console.error('Failed to load AIT details', err);
  }

  // ───────────────────── Navigation ────────────────────────  

  onEdit(): void {
    if (!this.ait?.id) return;
    this.router.navigate(['/ait/edit', this.ait.id]);
  }

  onBack(): void {
    this.router.navigate(['/ait']);
  }

  // ─────────────────────  UI Helpers  ───────────────────────

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
      'Dividend': 'src-dividend', 'Commission': 'src-commission'
    };
    return map[s] ?? '';
  }

  formatCurrency(amount: number): string {
    if (amount >= 10000000) return `৳${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `৳${(amount / 100000).toFixed(2)} L`;
    return `৳${amount.toLocaleString()}`;
  }
 
}