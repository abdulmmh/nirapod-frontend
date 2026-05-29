import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AitRecord, AitStatus } from '../../models/ait.model';

@Component({
  selector: 'app-records-table',
  templateUrl: './records-table.component.html',
  styleUrls: ['./records-table.component.css'],
})
export class RecordsTableComponent {
  @Input() records: AitRecord[] | null = null;
  @Input() editable: boolean = false;
  @Input() emptyMessage: string = 'No records found';
  @Input() showRefNo: boolean = true;
  @Input() showTaxpayer: boolean = true;
  @Input() showDutyRef: boolean = true;
  @Input() showAmount: boolean = true;
  @Input() showStatus: boolean = true;
  @Input() showDate: boolean = true;
  @Input() showActions: boolean = true;

  @Output() onView = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<number>();
  @Output() onDelete = new EventEmitter<number>();

  getStatusClass(status: AitStatus): string {
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
    return classes[status] || 'badge-draft';
  }

  getStatusLabel(status: AitStatus): string {
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
    return labels[status] || 'Unknown';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
