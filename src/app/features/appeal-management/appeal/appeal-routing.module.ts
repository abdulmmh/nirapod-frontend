import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { AppealListComponent }  from '../pages/appeal-list/appeal-list.component';
import { AppealViewComponent }  from '../pages/appeal-view/appeal-view.component';

const routes: Routes = [
  {
    path: '',
    component: AppealListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.SUPERVISOR, Role.AUDITOR, Role.TAX_OFFICER] }
  },
  {
    path: ':id',
    component: AppealViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.SUPERVISOR, Role.AUDITOR, Role.TAX_OFFICER] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppealRoutingModule {}
