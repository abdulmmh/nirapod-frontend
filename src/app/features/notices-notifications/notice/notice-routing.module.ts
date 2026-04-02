import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { NoticeCreateComponent } from '../pages/notice-create/notice-create.component';
import { NoticeListComponent } from '../pages/notice-list/notice-list.component';
import { NoticeViewComponent } from '../pages/notice-view/notice-view.component';


const routes: Routes = [
  {
    path: '',
    component: NoticeListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.TAX_OFFICER, Role.AUDITOR, Role.TAXPAYER] }
  },
  {
    path: 'create',
    component: NoticeCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.TAX_OFFICER] }
  },
  {
    path: ':id',
    component: NoticeViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.TAX_OFFICER, Role.AUDITOR, Role.TAXPAYER] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoticeRoutingModule { }
