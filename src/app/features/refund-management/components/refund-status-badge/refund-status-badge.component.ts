import { Component, Input } from '@angular/core';
import { RefundStatus } from 'src/app/models/refund.model';


interface BadgeConfig {
  label: string;
  cssClass: string;
  icon: string;
}

@Component({
  selector: 'app-refund-status-badge',
  templateUrl: './refund-status-badge.component.html',
  styleUrls: ['./refund-status-badge.component.css'],
})
export class RefundStatusBadgeComponent {
  @Input() status!: RefundStatus;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  readonly badgeMap: Record<RefundStatus, BadgeConfig> = {
    DRAFT:               { label: 'Draft',               cssClass: 'badge-draft',       icon: 'bi bi-pencil' },
    SUBMITTED:           { label: 'Submitted',           cssClass: 'badge-submitted',   icon: 'bi bi-send' },
    UNDER_VERIFICATION:  { label: 'Under Verification',  cssClass: 'badge-verify',      icon: 'bi bi-search' },
    INFO_REQUESTED:      { label: 'Info Requested',      cssClass: 'badge-info-req',    icon: 'bi bi-exclamation-triangle' },
    RESPONSE_RECEIVED:   { label: 'Response Received',   cssClass: 'badge-response',    icon: 'bi bi-reply' },
    RECOMMENDED:         { label: 'Recommended',         cssClass: 'badge-recommended', icon: 'bi bi-hand-thumbs-up' },
    SUPERVISOR_REVIEW:   { label: 'Supervisor Review',   cssClass: 'badge-supervisor',  icon: 'bi bi-person-check' },
    APPROVED:            { label: 'Approved',            cssClass: 'badge-approved',    icon: 'bi bi-check-circle' },
    REJECTED:            { label: 'Rejected',            cssClass: 'badge-rejected',    icon: 'bi bi-x-circle' },
    PAYMENT_PENDING:     { label: 'Payment Pending',     cssClass: 'badge-pay-pending', icon: 'bi bi-clock' },
    PAYMENT_PROCESSING:  { label: 'Processing',          cssClass: 'badge-processing',  icon: 'bi bi-arrow-repeat' },
    PAID:                { label: 'Paid',                cssClass: 'badge-paid',        icon: 'bi bi-check-circle-fill' },
    FAILED:              { label: 'Failed',              cssClass: 'badge-failed',      icon: 'bi bi-x-octagon' },
    CANCELLED:           { label: 'Cancelled',           cssClass: 'badge-cancelled',   icon: 'bi bi-slash-circle' },
    CLOSED:              { label: 'Closed',              cssClass: 'badge-closed',      icon: 'bi bi-archive' },
  };

  get config(): BadgeConfig {
    return this.badgeMap[this.status] ?? { label: this.status, cssClass: 'badge-secondary', icon: 'bi bi-question' };
  }
}
