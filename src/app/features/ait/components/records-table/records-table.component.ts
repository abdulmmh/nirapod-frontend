import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AitRecord, AitStatus } from '../../models/ait.model';

@Component({
  selector: 'app-records-table',
  template: `
    <div class="records-table-container">
      <table class="records-table" *ngIf="records && records.length > 0">
        <thead>
          <tr>
            <th *ngIf="showRefNo">Reference No</th>
            <th *ngIf="showTaxpayer">Taxpayer</th>
            <th *ngIf="showDutyRef">Duty Ref</th>
            <th *ngIf="showAmount">Amount</th>
            <th *ngIf="showStatus">Status</th>
            <th *ngIf="showDate">Date</th>
            <th *ngIf="showActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let record of records" class="record-row">
            <td *ngIf="showRefNo" class="ref-no">
              <strong>{{ record.aitReferenceNo }}</strong>
            </td>
            <td *ngIf="showTaxpayer">{{ record.taxpayerName }}</td>
            <td *ngIf="showDutyRef" class="duty-ref">{{ record.importDutyRefNo }}</td>
            <td *ngIf="showAmount" class="amount">৳ {{ record.calculatedAitAmount | number:'1.2-2' }}</td>
            <td *ngIf="showStatus">
              <span class="badge" [ngClass]="getStatusClass(record.status)">
                {{ getStatusLabel(record.status) }}
              </span>
            </td>
            <td *ngIf="showDate" class="date">{{ formatDate(record.createdAt || '') }}</td>
            <td *ngIf="showActions" class="actions">
              <button class="btn-action" (click)="onView.emit(record.id || 0)" title="View">
                <i class="ti ti-eye"></i>
              </button>
              <button class="btn-action" (click)="onEdit.emit(record.id || 0)" title="Edit" *ngIf="editable">
                <i class="ti ti-edit"></i>
              </button>
              <button class="btn-action" (click)="onDelete.emit(record.id || 0)" title="Delete" *ngIf="editable">
                <i class="ti ti-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!records || records.length === 0" class="empty-state">
        <i class="ti ti-inbox"></i>
        <p>{{ emptyMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    :root {
      --color-accent-primary: #0066cc;
      --color-text-primary: #1a1a1a;
      --color-text-secondary: #666;
      --color-background-secondary: #f9f9f9;
      --color-border: #e0e0e0;
      --color-border-light: #f0f0f0;
      --spacing-md: 16px;
    }

    .records-table-container {
      background-color: white;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }

    .records-table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
    }

    .records-table thead {
      background-color: var(--color-background-secondary);
      border-bottom: 2px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .records-table th {
      padding: var(--spacing-md);
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .records-table td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border-light);
      font-size: 13px;
      color: var(--color-text-primary);
    }

    .record-row {
      transition: background-color 0.3s;
    }

    .record-row:hover {
      background-color: var(--color-background-secondary);
    }

    .ref-no {
      color: var(--color-accent-primary);
      font-weight: 600;
    }

    .amount {
      text-align: right;
      font-weight: 500;
    }

    .date {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
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

    .actions {
      display: flex;
      gap: 4px;
    }

    .btn-action {
      background-color: transparent;
      border: none;
      color: var(--color-accent-primary);
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
      transition: color 0.3s;
    }

    .btn-action:hover {
      color: #0052a3;
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-md);
      color: var(--color-text-secondary);
    }

    .empty-state i {
      font-size: 32px;
      opacity: 0.3;
      display: block;
      margin-bottom: 8px;
    }

    .empty-state p {
      margin: 0;
      font-size: 13px;
    }
  `]
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
    return classes[status] || 'badge-draft';
  }

  getStatusLabel(status: AitStatus): string {
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
    return labels[status] || 'Unknown';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
