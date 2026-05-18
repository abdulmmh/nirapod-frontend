// public-verify-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerifyPageComponent } from '../pages/verify-page/verify-page.component';

// ⚠️ AuthGuard নেই — এই route সবার জন্য open
const routes: Routes = [
  { path: '', component: VerifyPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicVerifyRoutingModule {}
