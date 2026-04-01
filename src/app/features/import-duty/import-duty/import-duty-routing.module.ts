import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ImportDutyListComponent }   from '../pages/import-duty-list/import-duty-list.component';
import { ImportDutyCreateComponent } from '../pages/import-duty-create/import-duty-create.component';

const routes: Routes = [
  { path: '', component: ImportDutyListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: ImportDutyCreateComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportDutyRoutingModule { }