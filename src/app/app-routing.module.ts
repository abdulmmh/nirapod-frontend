import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { Role } from './core/constants/roles.constants';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/pages/login/login.component';

import { DashboardHomeComponent } from './features/dashboard/pages/dashboard-home/dashboard-home.component';
import { ReportsHomeComponent } from './features/reports-analytics/pages/reports-home/reports-home.component';
import { UserListComponent } from './features/user-management/pages/user-list/user-list.component';
import { SettingsHomeComponent } from './features/system-settings/pages/settings-home/settings-home.component';
import { ActivityLogsListComponent } from './features/activity-logs/pages/activity-logs-list/activity-logs-list.component';

const routes: Routes = [

  // ── Public ──
  { path: 'auth/login', component: LoginComponent },
  { path: 'unauthorized', redirectTo: 'dashboard' },

  // ── Protected Layout ──
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [

      // All roles
      { path: 'dashboard', component: DashboardHomeComponent },

      // Taxpayers Management
      {
        path: 'taxpayers',
        loadChildren: () =>
          import('./features/taxpayer-management/taxpayer/taxpayer.module')
            .then(m => m.TaxpayerModule)
      },

      // Business
      {
        path: 'businesses', 
        loadChildren: () =>
          import('./features/business-registration/business/business.module')
            .then(m => m.BusinessModule)
      },

      //TIN Management
      {
        path: 'tin',
        loadChildren: () =>
          import('./features/tin-management/tin/tin.module')
            .then(m => m.TinModule)
      },


      //VAT Registration
      {
        path: 'vat-registration',
        loadChildren: () =>
          import('./features/vat-registration/vat-registration/vat-registration.module')
            .then(m => m.VatRegistrationModule)
      },


      // VAT Returns 
      {
        path: 'vat-returns',
        loadChildren: () =>
          import('./features/vat-returns/vat-returns/vat-returns.module')
            .then(m => m.VatReturnsModule)
      },


      //Income-TAX-returns
      {
        path: 'income-tax-returns',
        loadChildren: () =>
          import('./features/income-tax-returns/income-tax-returns/income-tax-returns.module')
            .then(m => m.IncomeTaxReturnsModule)
      },


      // Payments
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/payments/payment/payment.module')
            .then(m => m.PaymentModule)
      },

      //Refund Management
      {
        path: 'refunds',
        loadChildren: () =>
          import('./features/refund-management/refund/refund.module')
            .then(m => m.RefundModule)
      },

      //Penalty & Fines     
      {
        path: 'penalties',
        loadChildren: () =>
          import('./features/penalty-fines/penalty/penalty.module')
            .then(m => m.PenaltyModule)
      },
      
      // Audits 
      {
        path: 'audits',
        loadChildren: () =>
          import('./features/audit-management/audit/audit.module')
            .then(m => m.AuditModule)
      },


      // Documents
      {
        path: 'documents',
        loadChildren: () =>
          import('./features/document-verification/document/document-verification.module')
            .then(m => m.DocumentVerificationModule)
      },

      // TAX CONFIGURATION modules
      {
        path: 'tax-structure',
        loadChildren: () =>
          import('./features/tax-structure/tax-structure/tax-structure.module')
            .then(m => m.TaxStructureModule)
      },
      {
        path: 'taxable-products',
        loadChildren: () =>
          import('./features/taxable-products/taxable-products/taxable-products.module')
            .then(m => m.TaxableProductsModule)
      },
      {
        path: 'import-duty',
        loadChildren: () =>
          import('./features/import-duty/import-duty/import-duty.module')
            .then(m => m.ImportDutyModule)
      },
      {
        path: 'ait',
        loadChildren: () =>
          import('./features/ait/ait/ait.module')
            .then(m => m.AitModule)
      },
      {
        path: 'fiscal-years',
        loadChildren: () =>
          import('./features/fiscal-years/fiscal-years/fiscal-years.module')
            .then(m => m.FiscalYearsModule)
      },

      // Administration
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports-analytics/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/user-management/user-management/user-management.module').then(m => m.UserManagementModule)
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/roles/roles/roles.module').then(m => m.RolesModule)
      },
      {
        path: 'activity-logs',
        loadChildren: () =>
          import('./features/activity-logs/activity-logs/activity-logs.module').then(m => m.ActivityLogsModule)
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/system-settings/settings/settings.module').then(m => m.SettingsModule)
      },
      // Notices — all roles
      {
        path: 'notices',
        loadChildren: () =>
          import('./features/notices-notifications/notice/notice.module')
            .then(m => m.NoticeModule)  
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}