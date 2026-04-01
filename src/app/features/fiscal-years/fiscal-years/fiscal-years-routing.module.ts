import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';
import { FiscalYearListComponent }   from '../pages/fiscal-year-list/fiscal-year-list.component';
import { FiscalYearCreateComponent } from '../pages/fiscal-year-create/fiscal-year-create.component';

const routes: Routes = [
  { path: '', component: FiscalYearListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: FiscalYearCreateComponent, canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FiscalYearsRoutingModule { }