import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { Taxpayer } from '../../../../models/taxpayer.model';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  selector: 'app-taxpayer-view',
  templateUrl: './taxpayer-view.component.html',
  styleUrls: ['./taxpayer-view.component.css']
})
export class TaxpayerViewComponent implements OnInit {

  taxpayer: Taxpayer | null = null;
  isLoading = true;
  taxpayerId: number | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const rawId    = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.toast.error('Invalid business ID. Please go back and try again.');
      return;
    }

    this.taxpayerId = parsedId;
    this.loadTaxpayer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

    loadTaxpayer(): void {
      this.isLoading = true;
  
      this.http.get<Taxpayer>(API_ENDPOINTS.TAXPAYERS.GET(this.taxpayerId!))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: data => {
            this.taxpayer  = data;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.toast.error('Failed to load taxpayer details. Please go back and try again.');
          }
        });
    }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'status-active', 'Inactive': 'status-inactive',
      'Pending': 'status-pending', 'Suspended': 'status-suspended'
    };
    return map[status] ?? '';
  }

  onEdit(): void { 
    if (!this.taxpayer?.id) return;
    this.router.navigate(['/taxpayers', 'edit', this.taxpayer?.id]); 
  }
  onBack(): void { this.router.navigate(['/taxpayers']); }
}