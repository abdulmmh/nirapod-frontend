import { Component, Input } from '@angular/core';
import { StatusHistoryEvent } from '../../models/ait.model';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css'],
})
export class AuditTrailComponent {
  @Input() events: StatusHistoryEvent[] | null = null;

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
