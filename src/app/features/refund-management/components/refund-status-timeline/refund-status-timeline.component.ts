import { Component, Input } from '@angular/core';
import { RefundStatusHistory } from '../../services/refund.service';

@Component({
  selector: 'app-refund-status-timeline',
  templateUrl: './refund-status-timeline.component.html',
  styleUrls: ['./refund-status-timeline.component.css'],
})
export class RefundStatusTimelineComponent {
  @Input() history: RefundStatusHistory[] = [];

  iconMap: Record<string, string> = {
    DRAFT:              'bi bi-pencil-square',
    SUBMITTED:          'bi bi-send-check',
    UNDER_VERIFICATION: 'bi bi-search',
    INFO_REQUESTED:     'bi bi-question-circle',
    RESPONSE_RECEIVED:  'bi bi-reply-fill',
    RECOMMENDED:        'bi bi-hand-thumbs-up',
    SUPERVISOR_REVIEW:  'bi bi-person-check',
    APPROVED:           'bi bi-check-circle',
    REJECTED:           'bi bi-x-circle',
    PAYMENT_PENDING:    'bi bi-hourglass',
    PAYMENT_PROCESSING: 'bi bi-arrow-repeat',
    PAID:               'bi bi-check-circle-fill',
    FAILED:             'bi bi-x-octagon',
    CANCELLED:          'bi bi-slash-circle',
    CLOSED:             'bi bi-archive-fill',
  };

  colorMap: Record<string, string> = {
    DRAFT:              'timeline-neutral',
    SUBMITTED:          'timeline-blue',
    UNDER_VERIFICATION: 'timeline-purple',
    INFO_REQUESTED:     'timeline-amber',
    RESPONSE_RECEIVED:  'timeline-amber',
    RECOMMENDED:        'timeline-teal',
    SUPERVISOR_REVIEW:  'timeline-purple',
    APPROVED:           'timeline-green',
    REJECTED:           'timeline-red',
    PAYMENT_PENDING:    'timeline-teal',
    PAYMENT_PROCESSING: 'timeline-blue',
    PAID:               'timeline-green',
    FAILED:             'timeline-red',
    CANCELLED:          'timeline-neutral',
    CLOSED:             'timeline-green',
  };

  getIcon(status: string): string {
    return this.iconMap[status] ?? 'bi bi-circle';
  }

  getColor(status: string): string {
    return this.colorMap[status] ?? 'timeline-neutral';
  }

  trackByHistoryId(_: number, item: RefundStatusHistory): number {
    return item.id;
  }
}
