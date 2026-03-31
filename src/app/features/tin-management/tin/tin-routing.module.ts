import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from 'src/app/core/constants/roles.constants';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

import { TinListComponent } from '../pages/tin-list/tin-list.component';
import { TinCreateComponent } from '../pages/tin-create/tin-create.component';
import { TinViewComponent } from '../pages/tin-view/tin-view.component';
import { TinEditComponent } from '../pages/tin-edit/tin-edit.component';

const routes: Routes = [
 {
       path: '',
       component: TinListComponent,
       canActivate: [AuthGuard],
       data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
     },
     {
       path: 'create',
       component: TinCreateComponent,
       canActivate: [AuthGuard],
       data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
     },
     {
       path: 'view/:id',
       component: TinViewComponent,
       canActivate: [AuthGuard],
       data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
     },
     {
       path: 'edit/:id',
       component: TinEditComponent,
       canActivate: [AuthGuard],
       data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
     }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TinRoutingModule { }
