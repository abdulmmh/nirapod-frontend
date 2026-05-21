import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TaxpayerPortalRoutingModule } from './taxpayer-portal-routing.module';
import { PortalHomeComponent } from '../pages/portal-home/portal-home.component';
import { PortalLayoutComponent } from '../layout/portal-layout/portal-layout.component';
import { PortalItrComponent } from '../pages/portal-itr/portal-itr.component';
import { FormsModule } from '@angular/forms';
import { PortalApplicationStatusComponent } from '../pages/portal-application-status/portal-application-status.component';
import { PortalAuditDetailComponent } from '../pages/portal-audit-detail/portal-audit-detail.component';
import { PortalAuditListComponent } from '../pages/portal-audit-list/portal-audit-list.component';

@NgModule({
  declarations: [
    PortalHomeComponent,
    PortalLayoutComponent,
    PortalItrComponent,
    PortalApplicationStatusComponent,
    PortalAuditDetailComponent,
    PortalAuditListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TaxpayerPortalRoutingModule,
  ]
})
export class TaxpayerPortalModule {}