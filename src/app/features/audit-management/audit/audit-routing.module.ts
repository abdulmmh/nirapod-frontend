import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { Role } from '../../../core/constants/roles.constants';


import { AuditListComponent }   from '../pages/audit-list/audit-list.component';
import { AuditCreateComponent } from '../pages/audit-create/audit-create.component';
import { AuditViewComponent }   from '../pages/audit-view/audit-view.component';
import { AuditEditComponent }   from '../pages/audit-edit/audit-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AuditListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.AUDITOR, Role.TAX_COMMISSIONER] }
  },
  {
    path: 'create',
    component: AuditCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.AUDITOR, Role.TAX_COMMISSIONER] }
  },
  {
    path: ':id',
    component: AuditViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.AUDITOR, Role.TAX_COMMISSIONER, Role.TAX_OFFICER] }
  },
  {
    path: ':id/edit',
    component: AuditEditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.AUDITOR, Role.TAX_COMMISSIONER] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditRoutingModule { }