import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';
import { FiscalYearListComponent }   from '../pages/fiscal-year-list/fiscal-year-list.component';
import { FiscalYearCreateComponent } from '../pages/fiscal-year-create/fiscal-year-create.component';
import { FiscalYearEditComponent } from '../pages/fiscal-year-edit/fiscal-year-edit.component';

const routes: Routes = [
  { path: '', component: FiscalYearListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: FiscalYearCreateComponent, canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER] } },
    {path: 'edit/:id', component: FiscalYearEditComponent, canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FiscalYearsRoutingModule { }