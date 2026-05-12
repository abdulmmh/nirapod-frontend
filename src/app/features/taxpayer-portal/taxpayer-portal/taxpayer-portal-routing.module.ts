import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalLayoutComponent } from '../layout/portal-layout/portal-layout.component';
import { PortalHomeComponent } from '../pages/portal-home/portal-home.component';
import { PortalItrComponent } from '../pages/portal-itr/portal-itr.component';

const routes: Routes = [
  {
    path: '',
    component: PortalLayoutComponent,
    children: [
      { path: '', component: PortalHomeComponent },
      { path: 'itr', component: PortalItrComponent },

      // Existing modules — portal layout এর ভেতরে

      { path: 'taxpayers', 
        loadChildren: () =>
          import('../../../features/taxpayer-management/taxpayer/taxpayer.module')
            .then(m => m.TaxpayerModule)
      },
      {
        path: 'tin',
        loadChildren: () =>
          import('../../../features/tin-management/tin/tin.module')
            .then(m => m.TinModule)
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('../../../features/payments/payment/payment.module')
            .then(m => m.PaymentModule)
      },
      {
        path: 'notices',
        loadChildren: () =>
          import('../../../features/notices-notifications/notice/notice.module')
            .then(m => m.NoticeModule)
      },
      {
        path: 'vat-returns',
        loadChildren: () =>
          import('../../../features/vat-returns/vat-returns/vat-returns.module')
            .then(m => m.VatReturnsModule)
      },
      {
        path: 'vat-registration',
        loadChildren: () =>
          import('../../../features/vat-registration/vat-registration/vat-registration.module')
            .then(m => m.VatRegistrationModule)
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('../../../features/document-verification/document/document-verification.module')
            .then(m => m.DocumentVerificationModule)
      },
      {
        path: 'ait',
        loadChildren: () =>
          import('../../../features/ait/ait/ait.module')
            .then(m => m.AitModule)
      },

      {
        path: 'income-tax-returns',
        loadChildren: () =>
          import('../../../features/income-tax-returns/income-tax-returns/income-tax-returns.module')
            .then(m => m.IncomeTaxReturnsModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxpayerPortalRoutingModule {}