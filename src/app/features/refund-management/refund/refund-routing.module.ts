import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from 'src/app/core/constants/roles.constants';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

import { RefundCreateComponent } from '../pages/refund-create/refund-create.component';
import { RefundEditComponent } from '../pages/refund-edit/refund-edit.component';
import { RefundListComponent } from '../pages/refund-list/refund-list.component';
import { RefundViewComponent } from '../pages/refund-view/refund-view.component';

const routes: Routes = [
  {
        path: '',
        component: RefundListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
      },
      {
        path: 'create',
        component: RefundCreateComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
      },
      {
        path: 'view/:id',
        component: RefundViewComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
      },
      {
        path: 'edit/:id',
        component: RefundEditComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefundRoutingModule { }
