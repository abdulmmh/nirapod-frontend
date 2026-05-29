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
   templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.css']
})
export class KPICardsComponent {
  @Input() cards: KPICard[] = [];
}
