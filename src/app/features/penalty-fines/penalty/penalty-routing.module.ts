import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { PenaltyListComponent } from '../pages/penalty-list/penalty-list.component';
import { PenaltyCreateComponent } from '../pages/penalty-create/penalty-create.component';
import { PenaltyEditComponent } from '../pages/penalty-edit/penalty-edit.component';
import { PenaltyViewComponent } from '../pages/penalty-view/penalty-view.component';


const routes: Routes = [
    {
      path: '',
      component: PenaltyListComponent,
      canActivate: [AuthGuard],
      data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR] }
    },
    {
      path: 'create',
      component: PenaltyCreateComponent,
      canActivate: [AuthGuard],
      data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
    },
    {
      path: 'view/:id',
      component: PenaltyViewComponent,
      canActivate: [AuthGuard],
      data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.TAXPAYER] }
    },
    {
      path: 'edit/:id',
      component: PenaltyEditComponent,
      canActivate: [AuthGuard],
      data: { roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER] }
    }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PenaltyRoutingModule {}