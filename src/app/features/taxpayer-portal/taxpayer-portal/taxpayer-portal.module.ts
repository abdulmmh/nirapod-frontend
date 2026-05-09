import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TaxpayerPortalRoutingModule } from './taxpayer-portal-routing.module';
import { PortalHomeComponent } from '../pages/portal-home/portal-home.component';
import { PortalLayoutComponent } from '../layout/portal-layout/portal-layout.component';
import { PortalItrComponent } from '../pages/portal-itr/portal-itr.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PortalHomeComponent,
    PortalLayoutComponent,
    PortalItrComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TaxpayerPortalRoutingModule,
  ]
})
export class TaxpayerPortalModule {}