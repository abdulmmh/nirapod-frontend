import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaxpayerPortalRoutingModule } from './taxpayer-portal-routing.module';
import { PortalHomeComponent } from '../pages/portal-home/portal-home.component';
import { PortalLayoutComponent } from '../layout/portal-layout/portal-layout.component';


@NgModule({
  declarations: [
    PortalHomeComponent,
    PortalLayoutComponent,

  ],
  imports: [
    CommonModule,
    RouterModule,
    TaxpayerPortalRoutingModule
  ]
})
export class TaxpayerPortalModule {}