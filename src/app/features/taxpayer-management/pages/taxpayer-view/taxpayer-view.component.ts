import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-taxpayer-view',
  templateUrl: './taxpayer-view.component.html',
  styleUrls: ['./taxpayer-view.component.css']
})
export class TaxpayerViewComponent implements OnInit {

 // ────────────────── Properties ──────────────────────

  taxpayer: Taxpayer | null = null;
  isLoading = true;
  taxpayerId: number | null = null;
  
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
    this.initializeTaxpayer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ────────────────────── Initialization  ─────────────────────

  private initializeTaxpayer(): void {
    const id = this.getValidTaxpayerId();

    if (!id) {
      this.handleInvalidId();
      return;
    }

    this.taxpayerId = id;
    this.fetchTaxpayer();
  }

  private getValidTaxpayerId(): number | null {
   const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    return rawId && !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
  }

  private handleInvalidId(): void {
    this.toast.error('Invalid taxpayer ID.Please go back and try again.');
    this.isLoading = false;
  }

  private fetchTaxpayer(): void {
    if (!this.taxpayerId) return;

    this.isLoading = true;

    this.http
      .get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(this.taxpayerId))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => this.handleFetchSuccess(data),
        error: (error) => this.handleFetchError(error),
      });
  }

  private handleFetchSuccess(data: Taxpayer): void {
    this.taxpayer = data;
  }

  private handleFetchError(error: any): void {
    this.toast.error('Failed to fetch taxpayer details. Please try again.');
    this.isLoading = false;
  }

 // ───────────────────── Navigation ────────────────────────

  onEdit(): void {
    if (!this.taxpayer?.id) return;
    this.router.navigate(['/taxpayers/edit', this.taxpayer.id]);
  }

  onBack(): void {
    this.router.navigate(['/Taxpayer']);
  }
  // ────────────────────── UI Helpers ──────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended'
    };
    return map[status] ?? '';
  }


}