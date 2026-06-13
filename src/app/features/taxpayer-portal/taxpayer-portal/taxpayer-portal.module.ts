import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TaxpayerPortalRoutingModule } from './taxpayer-portal-routing.module';
import { PortalHomeComponent } from '../pages/portal-home/portal-home.component';
import { PortalLayoutComponent } from '../layout/portal-layout/portal-layout.component';
import { PortalItrComponent } from '../pages/portal-itr/portal-itr.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PortalApplicationStatusComponent } from '../pages/portal-application-status/portal-application-status.component';
import { PortalAuditDetailComponent } from '../pages/portal-audit-detail/portal-audit-detail.component';
import { PortalAuditListComponent } from '../pages/portal-audit-list/portal-audit-list.component';
import { PortalAppealCreateComponent } from '../pages/portal-appeal-create/portal-appeal-create.component';
import { PortalAppealListComponent } from '../pages/portal-appeal-list/portal-appeal-list.component';
import { PortalAppealDetailComponent } from '../pages/portal-appeal-detail/portal-appeal-detail.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    PortalHomeComponent,
    PortalLayoutComponent,
    PortalItrComponent,
    PortalApplicationStatusComponent,
    PortalAuditDetailComponent,
    PortalAuditListComponent, 
    PortalAppealCreateComponent,
    PortalAppealListComponent,
    PortalAppealDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TaxpayerPortalRoutingModule,
  ]
})
export class TaxpayerPortalModule {}