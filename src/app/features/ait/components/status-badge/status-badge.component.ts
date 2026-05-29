import { Component, Input } from '@angular/core';
import { AitStatus } from '../../models/ait.model';

@Component({
  selector: 'app-status-badge',
  template: ``,
  styles: [``],
})
export class StatusBadgeComponent {
  @Input() status: AitStatus = 'DRAFT';

  getStatusClass(): string {
    const classes: Record<AitStatus, string> = {
      DRAFT: 'badge-draft',
      SUBMITTED: 'badge-submitted',
      PENDING: 'badge-pending',
      PAID: 'badge-paid',
      UNDER_REVIEW: 'badge-review',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
      CREDITED: 'badge-credited',
      CANCELLED: 'badge-cancelled',
    };
    return classes[this.status] || 'badge-draft';
  }

  getStatusLabel(): string {
    const labels: Record<AitStatus, string> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      PENDING: 'Pending',
      PAID: 'Paid',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CREDITED: 'Credited',
      CANCELLED: 'Cancelled',
    };
    return labels[this.status] || 'Unknown';
  }
}
