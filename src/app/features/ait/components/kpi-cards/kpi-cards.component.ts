import { Component, Input } from '@angular/core';

export interface KPICard {
  label: string;
  value: number | string;
  description: string;
  icon: string;
  iconColor: 'primary' | 'info' | 'success' | 'warning' | 'danger';
}

@Component({
  selector: 'app-kpi-cards',
  template: `
    <div class="kpi-grid">
      <div *ngFor="let card of cards" class="kpi-card">
        <div class="kpi-content">
          <p class="kpi-label">{{ card.label }}</p>
          <h2 class="kpi-value">{{ card.value }}</h2>
          <p class="kpi-description">{{ card.description }}</p>
        </div>
        <div class="kpi-icon" [ngClass]="'icon-' + card.iconColor">
          <i [ngClass]="'ti ' + card.icon"></i>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-accent-primary: #0066cc;
      --color-info: #0066cc;
      --color-success: #00aa44;
      --color-warning: #ff9900;
      --color-danger: #dd0000;
      --spacing-lg: 24px;
      --spacing-md: 16px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
    }

    .kpi-card {
      background-color: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: var(--spacing-lg);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      transition: all 0.3s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .kpi-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 8px 0;
    }

    .kpi-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--color-accent-primary);
      margin: 0 0 8px 0;
    }

    .kpi-description {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .kpi-icon {
      font-size: 32px;
      opacity: 0.2;
      margin-left: 16px;
    }

    .icon-primary { color: var(--color-accent-primary); }
    .icon-info { color: var(--color-info); }
    .icon-success { color: var(--color-success); }
    .icon-warning { color: var(--color-warning); }
    .icon-danger { color: var(--color-danger); }
  `]
})
export class KPICardsComponent {
  @Input() cards: KPICard[] = [];
}
