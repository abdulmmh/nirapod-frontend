// certificate-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { CertificateListComponent } from '../pages/certificate-list/certificate-list.component';
import { CertificateViewComponent } from '../pages/certificate-view/certificate-view.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '',          component: CertificateListComponent },
      { path: ':type/:id', component: CertificateViewComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificateRoutingModule {}
