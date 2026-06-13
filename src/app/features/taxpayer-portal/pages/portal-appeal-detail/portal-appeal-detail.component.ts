import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppealService } from '../../../appeal-management/service/appeal.service';
import { Appeal } from '../../../appeal-management/model/appeal.model';

@Component({
  selector: 'app-portal-appeal-detail',
  templateUrl: './portal-appeal-detail.component.html',
  styleUrls: ['./portal-appeal-detail.component.css']
})
export class PortalAppealDetailComponent implements OnInit {

  appeal:       Appeal | null = null;
  isLoading     = false;
  appealId      = 0;

  showWithdrawModal  = false;
  withdrawReason     = '';
  withdrawSubmitting = false;

  constructor(
    private route:         ActivatedRoute,
    private router:        Router,
    private appealService: AppealService
  ) {}

  ngOnInit(): void {
    this.appealId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.appealService.getMyAppealById(this.appealId).subscribe({
      next: a => { this.appeal = a; this.isLoading = false; },
      error: () => { this.isLoading = false; this.router.navigate(['/my-portal/appeals']); }
    });
  }

  onBack(): void { this.router.navigate(['/my-portal/appeals']); }

  canWithdraw(): boolean {
    return !!this.appeal && ['FILED', 'UNDER_REVIEW'].includes(this.appeal.status);
  }

  submitWithdraw(): void {
    this.withdrawSubmitting = true;
    this.appealService.withdraw(this.appealId, this.withdrawReason).subscribe({
      next: a => {
        this.appeal = a;
        this.withdrawSubmitting = false;
        this.showWithdrawModal = false;
      },
      error: () => { this.withdrawSubmitting = false; }
    });
  }

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

  getDecisionMessage(d: string): string {
    const m: Record<string,string> = {
      UPHELD:           'Your appeal was successful. The demand has been cancelled.',
      PARTIALLY_UPHELD: 'Your appeal was partially successful. Partial relief has been granted.',
      DISMISSED:        'Your appeal was dismissed. The original demand remains in effect.',
    };
    return m[d] ?? '';
  }
}
