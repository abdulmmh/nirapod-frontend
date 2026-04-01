import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { IncomeTaxReturnViewComponent } from '../pages/income-tax-return-view/income-tax-return-view.component';
import { IncomeTaxReturnEditComponent } from '../pages/income-tax-return-edit/income-tax-return-edit.component';
import { IncomeTaxReturnListComponent } from '../pages/income-tax-return-list/income-tax-return-list.component';
import { IncomeTaxReturnCreateComponent } from '../pages/income-tax-return-create/income-tax-return-create.component';

const routes: Routes = [
  {
    path: '',
    component: IncomeTaxReturnListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
  },
  {
    path: 'create',
    component: IncomeTaxReturnCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
  },
  {
    path: 'view/:id',
    component: IncomeTaxReturnViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
  },
  {
    path: 'edit/:id',
    component: IncomeTaxReturnEditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomeTaxReturnsRoutingModule { }
