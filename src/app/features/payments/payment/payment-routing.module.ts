import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { PaymentListComponent } from '../pages/payment-list/payment-list.component';
import { PaymentCreateComponent } from '../pages/payment-create/payment-create.component';
import { PaymentViewComponent } from '../pages/payment-view/payment-view.component';
import { PaymentEditComponent } from '../pages/payment-edit/payment-edit.component';

const routes: Routes = [
  {
        path: '',
        component: PaymentListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
      },
      {
        path: 'create',
        component: PaymentCreateComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
      },
      {
        path: 'view/:id',
        component: PaymentViewComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
      },
      {
        path: 'edit/:id',
        component: PaymentEditComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
