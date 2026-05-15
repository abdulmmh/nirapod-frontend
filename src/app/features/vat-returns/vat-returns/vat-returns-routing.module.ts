import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { Role } from '../../../core/constants/roles.constants';

import { VatReturnListComponent } from '../pages/vat-return-list/vat-return-list.component';
import { VatReturnCreateComponent } from '../pages/vat-return-create/vat-return-create.component';
import { VatReturnViewComponent } from '../pages/vat-return-view/vat-return-view.component';
import { VatReturnEditComponent } from '../pages/vat-return-edit/vat-return-edit.component';


const routes: Routes = [
  {
        path: '',
        component: VatReturnListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
      },
      {
        path: 'create',
        component: VatReturnCreateComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
      },
      {
        path: 'view/:id',
        component: VatReturnViewComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
      },
      {
        path: 'edit/:id',
        component: VatReturnEditComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.TAXPAYER] }
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VatReturnsRoutingModule { }
