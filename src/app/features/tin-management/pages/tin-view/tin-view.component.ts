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

  tin: Tin | null = null;
  isLoading = true;
  tinId: number | null = null;
 
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.toast.error('Invalid business ID. Please go back and try again.');
      return;
    }

    this.tinId = parsedId;
    this.loadTin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTin(): void {
    this.isLoading = true;
    
        this.http
          .get<Tin>(API_ENDPOINTS.TINS.GET(this.tinId!))
          .pipe(takeUntil(this.destroy$),
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: (data) => {
              this.tin = data;
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
              this.toast.error(
                'Failed to load tin details. Please go back and try again.',
              );
            },
          });
      }

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

  onEdit(): void { this.router.navigate(['/tin/edit', this.tin?.id]); }
  onBack(): void { this.router.navigate(['/tin']); }
}