import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from 'src/app/core/constants/roles.constants';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

import { VatRegistrationListComponent } from '../pages/vat-registration-list/vat-registration-list.component';
import { VatRegistrationCreateComponent } from '../pages/vat-registration-create/vat-registration-create.component';
import { VatRegistrationViewComponent } from '../pages/vat-registration-view/vat-registration-view.component';
import { VatRegistrationEditComponent } from '../pages/vat-registration-edit/vat-registration-edit.component';

const routes: Routes = [
  {
        path: '',
        component: VatRegistrationListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
      },
      {
        path: 'create',
        component: VatRegistrationCreateComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
      },
      {
        path: 'view/:id',
        component: VatRegistrationViewComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
      },
      {
        path: 'edit/:id',
        component: VatRegistrationEditComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VatRegistrationRoutingModule { }
