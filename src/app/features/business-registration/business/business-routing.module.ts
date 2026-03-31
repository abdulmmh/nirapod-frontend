import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { BusinessListComponent } from '../pages/business-list/business-list.component';
import { BusinessCreateComponent } from '../pages/business-create/business-create.component';
import { BusinessViewComponent } from '../pages/business-view/business-view.component';
import { BusinessEditComponent } from '../pages/business-edit/business-edit.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
  },
  {
    path: 'create',
    component: BusinessCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
  },
  {
    path: 'view/:id',
    component: BusinessViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
  },
  {
    path: 'edit/:id',
    component: BusinessEditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { }
