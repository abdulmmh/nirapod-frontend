import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { TaxpayerListComponent } from '../pages/taxpayer-list/taxpayer-list.component';
import { TaxpayerCreateComponent } from '../pages/taxpayer-create/taxpayer-create.component';
import { TaxpayerEditComponent } from '../pages/taxpayer-edit/taxpayer-edit.component';
import { TaxpayerViewComponent } from '../pages/taxpayer-view/taxpayer-view.component';

const routes: Routes = [
  {
    path: '',
    component: TaxpayerListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR] }
  },
  {
    path: 'create',
    component: TaxpayerCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR] }
  },
  {
    path: 'view/:id',
    component: TaxpayerViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR,
      Role.AUDITOR
    ] }
  },
  {
    path: 'edit/:id',
    component: TaxpayerEditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxpayerRoutingModule { }
