import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsDashboardComponent } from '../pages/reports-dashboard/reports-dashboard.component';

@NgModule({
  declarations: [ReportsDashboardComponent],
  imports: [CommonModule, FormsModule, SharedModule, ReportsRoutingModule]
})
export class ReportsModule { }