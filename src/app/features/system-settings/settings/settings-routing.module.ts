import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from '../pages/settings/settings.component';

const routes: Routes = [
  { path: '',       component: SettingsComponent },
  { path: 'email',  component: SettingsComponent },
  { path: 'backup', component: SettingsComponent },
  { path: 'info',   component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }