import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';

import { TaxStructureListComponent }   from '../pages/tax-structure-list/tax-structure-list.component';
import { TaxStructureCreateComponent } from '../pages/tax-structure-create/tax-structure-create.component';


const routes: Routes = [
  {
    path: '',
    component: TaxStructureListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.TAX_OFFICER] }
  },
  {
    path: 'create',
    component: TaxStructureCreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxStructureRoutingModule { }