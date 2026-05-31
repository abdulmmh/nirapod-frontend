import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';
import { ReportsDashboardComponent } from '../pages/reports-dashboard/reports-dashboard.component';
import { VatCollectionReportComponent } from '../pages/vat-collection-report/vat-collection-report.component';
import { IncomeTaxReportComponent } from '../pages/income-tax-report/income-tax-report.component';
import { PenaltyReportComponent } from '../pages/penalty-report/penalty-report.component';
import { RefundReportComponent } from '../pages/refund-report/refund-report.component';
import { AitReportComponent } from '../pages/ait-report/ait-report.component';
import { ImportDutyReportComponent } from '../pages/import-duty-report/import-duty-report.component';

const routes: Routes = [
  // ── Dashboard ────────────────────────────────────────────────────────────
  {
    path: '',
    component: ReportsDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.SUPER_ADMIN,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
        Role.TAXPAYER,
      ],
      breadcrumb: 'Reports & Analytics',
      title: 'Reports & Analytics',
    },
  },

  // ── VAT Collection drill-down ─────────────────────────────────────────────
  {
    path: 'vat-collection',
    component: VatCollectionReportComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.SUPER_ADMIN,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
      ],
      breadcrumb: 'VAT Collection Report',
      title: 'VAT Collection Report',
    },
  },

  // ── Income Tax drill-down ─────────────────────────────────────────────────
  {
    path: 'income-tax',
    component: IncomeTaxReportComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.SUPER_ADMIN,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
      ],
      breadcrumb: 'Income Tax Report',
      title: 'Income Tax Returns Report',
    },
  },

  // ── Import Duty drill-down ────────────────────────────────────────────────
  {
    path: 'import-duty',
    component: ImportDutyReportComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.SUPER_ADMIN,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
      ],
      breadcrumb: 'Import Duty Report',
      title: 'Import Duty Report',
    },
  },

  // ── AIT drill-down ────────────────────────────────────────────────────────
  {
    path: 'ait-report',
    component: AitReportComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.SUPER_ADMIN,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
        Role.TAXPAYER,
      ],
      breadcrumb: 'AIT Deduction Report',
      title: 'AIT Deduction Report',
    },
  },

  // ── Penalty drill-down ────────────────────────────────────────────────────
  {
    path: 'penalty-report',
    component: PenaltyReportComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.SUPER_ADMIN,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
      ],
      breadcrumb: 'Penalty Collection Report',
      title: 'Penalty Collection Report',
    },
  },

  // ── Refund drill-down ─────────────────────────────────────────────────────
  {
    path: 'refund-report',
    component: RefundReportComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        Role.SUPER_ADMIN,
        Role.TAX_OFFICER,
        Role.TAX_COMMISSIONER,
        Role.AUDITOR,
        Role.TAXPAYER,
      ],
      breadcrumb: 'Refund Status Report',
      title: 'Refund Status Report',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
