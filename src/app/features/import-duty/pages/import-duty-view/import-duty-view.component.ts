import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportDuty } from '../../../../models/import-duty.model';

@Component({
  selector: 'app-import-duty-view',
  templateUrl: './import-duty-view.component.html',
  styleUrls: ['./import-duty-view.component.css'],
})
export class ImportDutyViewComponent implements OnInit {
  record: ImportDuty | null = null;
  isLoading = true;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<ImportDuty>(API_ENDPOINTS.IMPORT_DUTIES.GET(id)).subscribe({
      next: record => { this.record = record; this.isLoading = false; },
      error: () => { this.record = null; this.isLoading = false; this.toast.error('Could not load this record.'); },
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      Draft: 'status-draft',
      Pending: 'status-pending',
      Assessed: 'status-review',
      Paid: 'status-paid',
      Cleared: 'status-active',
      Disputed: 'status-suspended',
    };
    return map[s] ?? '';
  }

  fmt(a: number): string {
    if (a === 0) return 'BDT 0';
    if (a >= 100000) return `BDT ${(a / 100000).toFixed(2)}L`;
    return `BDT ${a.toLocaleString('en-BD')}`;
  }

  onEdit(): void {
    this.router.navigate(['/import-duty/edit', this.record?.id]);
  }

  onBack(): void {
    this.router.navigate(['/import-duty']);
  }
}
