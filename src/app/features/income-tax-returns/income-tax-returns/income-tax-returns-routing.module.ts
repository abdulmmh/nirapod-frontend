import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { IncomeTaxReturnViewComponent } from '../pages/income-tax-return-view/income-tax-return-view.component';
import { IncomeTaxReturnEditComponent } from '../pages/income-tax-return-edit/income-tax-return-edit.component';
import { IncomeTaxReturnListComponent } from '../pages/income-tax-return-list/income-tax-return-list.component';
import { IncomeTaxReturnCreateComponent } from '../pages/income-tax-return-create/income-tax-return-create.component';
import { It10bComponent } from '../pages/IT10B/it10b.component';

const routes: Routes = [
  {
    path: '',
    component: IncomeTaxReturnListComponent,
    canActivate: [AuthGuard],
    // ✅ Fixed: TAXPAYER was excluded — they couldn't see their own filed returns
    // ✅ Fixed: DATA_ENTRY_OPERATOR added — they file returns but couldn't list them
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.DATA_ENTRY_OPERATOR, Role.TAXPAYER] }
  },
  {
    path: 'create',
    component: IncomeTaxReturnCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR, Role.TAXPAYER] }
  },
  {
    path: 'view/:id',
    component: IncomeTaxReturnViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.DATA_ENTRY_OPERATOR, Role.TAXPAYER] }
  },
  {
    path: 'edit/:id',
    component: IncomeTaxReturnEditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR] }
  },
  {
    path: ':returnId/it10b',
    component: It10bComponent,
    canActivate: [AuthGuard],
    // ✅ Fixed: TAXPAYER was locked out of their own wealth statement form
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR, Role.TAXPAYER] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomeTaxReturnsRoutingModule { }