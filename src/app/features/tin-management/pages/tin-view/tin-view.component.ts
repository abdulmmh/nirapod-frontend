import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tin } from '../../../../models/tin.model';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-tin-view',
  templateUrl: './tin-view.component.html',
  styleUrls: ['./tin-view.component.css']
})
export class TinViewComponent implements OnInit {


  // ────────────────── Properties ─────────────────────

  tin: Tin | null = null;
  isLoading = true;
  tinId: number | null = null;
 
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
    this.initializeTin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ────────────────────── Initialization  ─────────────────────
  
  private initializeTin(): void {
    const id = this.getValidTinId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.tinId = id;
    this.fetchTin();
  }

  private getValidTinId(): number | null {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.toast.error('Invalid TIN ID. Please go back and try again.');
  }

  // ───────────────────────  Data Fetching ──────────────────

  private fetchTin(): void {
    if (!this.tinId) return;

    this.http
      .get<Tin>(API_ENDPOINTS.TINS.GET(this.tinId!))
      .pipe(takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Tin): void {
    this.tin = data;
  }

  private handleFetchError(error: unknown): void {
    console.error('Failed to load TIN record', error);
    this.toast.error(
      'Failed to load TIN records. Please go back and try again.',
    );
  }

  // ───────────────────── Navigation ────────────────────────  

  
  onEdit(): void { this.router.navigate(['/tin/edit', this.tin?.id]); }
  onBack(): void { this.router.navigate(['/tin']); }

  // ─────────────────────  UI Helpers  ───────────────────────

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended',
      'Cancelled': 'status-inactive'
    };
    return map[s] ?? '';
  }

  getCategoryIcon(c: string): string {
    const map: Record<string, string> = {
      'Individual': 'bi bi-person-fill', 'Company': 'bi bi-building-fill',
      'Partnership': 'bi bi-people-fill', 'NGO': 'bi bi-heart-fill',
      'Government': 'bi bi-bank2'
    };
    return map[c] ?? 'bi bi-person-fill';
  }

}