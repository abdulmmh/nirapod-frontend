import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { IncomeTaxListComponent } from '../pages/income-tax-list/income-tax-list.component';
import { IncomeTaxCreateComponent } from '../pages/income-tax-create/income-tax-create.component';
import { IncomeTaxViewComponent } from '../pages/income-tax-view/income-tax-view.component';

const routes: Routes = [
  {
    path: '',
    component: IncomeTaxListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
  },
  {
    path: 'create',
    component: IncomeTaxCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
  },
  {
    path: 'view/:id',
    component: IncomeTaxViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
  },
  {
    path: 'edit/:id',
    component: IncomeTaxCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomeTaxRoutingModule { }
