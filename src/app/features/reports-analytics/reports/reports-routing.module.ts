import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';
import { ReportsDashboardComponent } from '../pages/reports-dashboard/reports-dashboard.component';

// Drill-down report routes — create each component separately in Phase 6
// import { VatCollectionReportComponent } from '../pages/vat-collection-report/vat-collection-report.component';
// import { IncomeTaxReportComponent } from '../pages/income-tax-report/income-tax-report.component';
// import { ImportDutyReportComponent } from '../pages/import-duty-report/import-duty-report.component';
// import { AitReportComponent } from '../pages/ait-report/ait-report.component';
// import { PenaltyReportComponent } from '../pages/penalty-report/penalty-report.component';
// import { RefundReportComponent } from '../pages/refund-report/refund-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [Role.SUPER_ADMIN, Role.TAX_OFFICER, Role.AUDITOR, Role.TAXPAYER],
      breadcrumb: 'Reports & Analytics',
      title: 'Reports & Analytics',
    },
  },
  // Drill-down routes (activate when components are built in Phase 6):
  // { path: 'vat-collection',   component: VatCollectionReportComponent,   canActivate: [AuthGuard] },
  // { path: 'income-tax',       component: IncomeTaxReportComponent,        canActivate: [AuthGuard] },
  // { path: 'import-duty',      component: ImportDutyReportComponent,       canActivate: [AuthGuard] },
  // { path: 'ait-report',       component: AitReportComponent,              canActivate: [AuthGuard] },
  // { path: 'penalty-report',   component: PenaltyReportComponent,          canActivate: [AuthGuard] },
  // { path: 'refund-report',    component: RefundReportComponent,           canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
