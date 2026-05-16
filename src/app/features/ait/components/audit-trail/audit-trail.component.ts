import { Component, Input } from '@angular/core';
import { StatusHistoryEvent } from '../../models/ait.model';

@Component({
  selector: 'app-audit-trail',
  template: `
    <div class="audit-section">
      <h3><i class="ti ti-history"></i> Status History</h3>
      <div class="audit-trail" *ngIf="events && events.length > 0">
        <div *ngFor="let event of events; let i = last" class="audit-item" [class.last]="i">
          <div class="audit-dot"></div>
          <div class="audit-content">
            <p class="audit-transition">
              <strong>{{ event.fromStatus }}</strong> → <strong>{{ event.toStatus }}</strong>
            </p>
            <p class="audit-meta">
              by {{ event.changedBy }} on {{ formatDate(event.changedAt) }}
            </p>
            <p class="audit-reason" *ngIf="event.changeReason">{{ event.changeReason }}</p>
          </div>
        </div>
      </div>
      <div *ngIf="!events || events.length === 0" class="empty">
        No status changes recorded yet.
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-accent-primary: #0066cc;
      --color-background-secondary: #f9f9f9;
      --color-border: #e0e0e0;
      --color-border-light: #f0f0f0;
      --color-text-primary: #1a1a1a;
      --color-text-secondary: #666;
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
    }

    .audit-section {
      padding: var(--spacing-md);
    }

    .audit-section h3 {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 var(--spacing-md) 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .audit-trail {
      position: relative;
    }

    .audit-trail::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background-color: var(--color-border);
    }

    .audit-item {
      position: relative;
      padding-left: 28px;
      margin-bottom: var(--spacing-md);
    }

    .audit-item.last {
      margin-bottom: 0;
    }

    .audit-dot {
      position: absolute;
      left: 0;
      top: 2px;
      width: 14px;
      height: 14px;
      background-color: var(--color-accent-primary);
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px var(--color-border);
    }

    .audit-content {
      background-color: var(--color-background-secondary);
      border: 1px solid var(--color-border-light);
      border-radius: 4px;
      padding: var(--spacing-md);
    }

    .audit-transition {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .audit-meta {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .audit-reason {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin: 0;
      font-style: italic;
    }

    .empty {
      font-size: 13px;
      color: var(--color-text-secondary);
      text-align: center;
      padding: var(--spacing-md);
    }
  `]
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
      minute: '2-digit'
    });
  }
}
