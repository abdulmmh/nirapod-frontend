import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';
import { TaxStructureListComponent }   from '../pages/tax-structure-list/tax-structure-list.component';
import { TaxStructureCreateComponent } from '../pages/tax-structure-create/tax-structure-create.component';
import { TaxStructureViewComponent }   from '../pages/tax-structure-view/tax-structure-view.component';
import { TaxStructureEditComponent }   from '../pages/tax-structure-edit/tax-structure-edit.component';

const routes: Routes = [
  { path: '',          component: TaxStructureListComponent,  canActivate: [AuthGuard] },
  { path: 'create',   component: TaxStructureCreateComponent, canActivate: [AuthGuard] },
  { path: 'view/:id', component: TaxStructureViewComponent,   canActivate: [AuthGuard] },
  { path: 'edit/:id', component: TaxStructureEditComponent,   canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxStructureRoutingModule { }