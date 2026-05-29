import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from '../../../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsDashboardComponent } from '../pages/reports-dashboard/reports-dashboard.component';

@NgModule({
  declarations: [ReportsDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    SharedModule,
    ReportsRoutingModule,
  ],
})
export class ReportsModule {}
