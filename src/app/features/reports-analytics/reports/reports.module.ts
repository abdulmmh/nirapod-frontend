import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from '../../../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';

import { ReportsDashboardComponent } from '../pages/reports-dashboard/reports-dashboard.component';
import { VatCollectionReportComponent } from '../pages/vat-collection-report/vat-collection-report.component';
import { IncomeTaxReportComponent } from '../pages/income-tax-report/income-tax-report.component';
import { PenaltyReportComponent } from '../pages/penalty-report/penalty-report.component';
import { RefundReportComponent } from '../pages/refund-report/refund-report.component';
import { AitReportComponent } from '../pages/ait-report/ait-report.component';
import { ImportDutyReportComponent } from '../pages/import-duty-report/import-duty-report.component';

@NgModule({
  declarations: [
    ReportsDashboardComponent,
    VatCollectionReportComponent,
    IncomeTaxReportComponent,
    PenaltyReportComponent,
    RefundReportComponent,
    AitReportComponent,
    ImportDutyReportComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    SharedModule,
    ReportsRoutingModule,
  ],
})
export class ReportsModule {}
