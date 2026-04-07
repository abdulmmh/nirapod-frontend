import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ait } from '../../../../models/ait.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';

@Component({
  selector: 'app-ait-view',
  templateUrl: './ait-view.component.html',
  styleUrls: ['./ait-view.component.css']
})
export class AitViewComponent implements OnInit {

  record: Ait | null = null;
  isLoading = true;

  errorMsg = '';

  aitId : number | null = null;

  private destroy$ = new Subject<void>();


  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const rawId   = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(rawId);

    if (!rawId || isNaN(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.errorMsg  = 'Invalid Ait ID. Please go back and try again.';
      return;
    }
    this.aitId = parsedId;
    this.loadAit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAit(): void {
      this.isLoading = true;
      this.errorMsg  = '';
  
      this.http.get<Ait>(API_ENDPOINTS.AIT.GET(this.aitId!))
        .pipe(takeUntil(this.destroy$)) // FIX #3: Auto-cancel on destroy
        .subscribe({
          next: data => {
            this.record  = data;
            this.isLoading = false;
          },
          // FIX #1: Removed fake fallback array entirely — show a real error instead
          error: () => {
            this.isLoading = false;
            this.errorMsg  = 'Failed to load Ait details. Please go back and try again.';
          }
        });
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
      'Dividend': 'src-dividend', 'Commission': 'src-commission'
    };
    return map[s] ?? '';
  }

  fmt(a: number): string { return `৳${a.toLocaleString()}`; }
  onEdit(): void { this.router.navigate(['/ait/edit', this.record?.id]); }
  onBack(): void { this.router.navigate(['/ait']); }
}