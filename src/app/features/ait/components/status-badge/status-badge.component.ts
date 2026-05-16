import { Component, Input } from '@angular/core';
import { AitStatus } from '../../models/ait.model';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [ngClass]="getStatusClass()">{{ getStatusLabel() }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-draft { background-color: #e0e0e0; color: #666; }
    .badge-submitted { background-color: #e3f2fd; color: #1976d2; }
    .badge-pending { background-color: #fff3e0; color: #f57c00; }
    .badge-paid { background-color: #e8f5e9; color: #388e3c; }
    .badge-review { background-color: #fce4ec; color: #c2185b; }
    .badge-approved { background-color: #e8f5e9; color: #00aa44; }
    .badge-rejected { background-color: #ffebee; color: #dd0000; }
    .badge-credited { background-color: #e0f2f1; color: #00897b; }
    .badge-cancelled { background-color: #f5f5f5; color: #999; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: AitStatus = 'DRAFT';

  getStatusClass(): string {
    const classes: Record<AitStatus, string> = {
      'DRAFT': 'badge-draft',
      'SUBMITTED': 'badge-submitted',
      'PENDING': 'badge-pending',
      'PAID': 'badge-paid',
      'UNDER_REVIEW': 'badge-review',
      'APPROVED': 'badge-approved',
      'REJECTED': 'badge-rejected',
      'CREDITED': 'badge-credited',
      'CANCELLED': 'badge-cancelled',
    };
    return classes[this.status] || 'badge-draft';
  }

  getStatusLabel(): string {
    const labels: Record<AitStatus, string> = {
      'DRAFT': 'Draft',
      'SUBMITTED': 'Submitted',
      'PENDING': 'Pending',
      'PAID': 'Paid',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'CREDITED': 'Credited',
      'CANCELLED': 'Cancelled',
    };
    return labels[this.status] || 'Unknown';
  }
}
