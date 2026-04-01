import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { AitListComponent }   from '../pages/ait-list/ait-list.component';
import { AitCreateComponent } from '../pages/ait-create/ait-create.component';

const routes: Routes = [
  { path: '', component: AitListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: AitCreateComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AitRoutingModule { }