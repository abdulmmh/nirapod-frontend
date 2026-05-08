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
      { path: '',    component: PortalHomeComponent },
      { path: 'itr', component: PortalItrComponent  },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxpayerPortalRoutingModule {}