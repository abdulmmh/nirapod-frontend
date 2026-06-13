import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppealService } from '../../../appeal-management/service/appeal.service';
import { Appeal } from '../../../appeal-management/model/appeal.model';

@Component({
  selector: 'app-portal-appeal-list',
  templateUrl: './portal-appeal-list.component.html',
  styleUrls: ['./portal-appeal-list.component.css']
})
export class PortalAppealListComponent implements OnInit {

  appeals:   Appeal[] = [];
  isLoading  = false;

  constructor(
    private appealService: AppealService,
    private router:        Router
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.appealService.getMyAppeals().subscribe({
      next: data => { this.appeals = data; this.isLoading = false; },
      error: ()   => { this.isLoading = false; }
    });
  }

  view(id: number): void { this.router.navigate(['/my-portal/appeals', id]); }

  getStatusClass(s: string): string {
    const m: Record<string,string> = {
      FILED:'badge-info', UNDER_REVIEW:'badge-warning',
      HEARING_SCHEDULED:'badge-orange', DECIDED:'badge-purple',
      CLOSED:'badge-muted', WITHDRAWN:'badge-muted',
    };
    return m[s] ?? 'badge-secondary';
  }

  getStatusLabel(s: string): string { return s?.replace(/_/g,' ') ?? s; }

  getDecisionClass(d: string): string {
    return { UPHELD:'badge-success', PARTIALLY_UPHELD:'badge-lime', DISMISSED:'badge-danger' }[d] ?? 'badge-secondary';
  }

  isActive(a: Appeal): boolean {
    return !['CLOSED','WITHDRAWN'].includes(a.status);
  }
}
