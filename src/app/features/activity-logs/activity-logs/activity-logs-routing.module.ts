import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityLogsListComponent } from '../pages/activity-logs-list/activity-logs-list.component';

const routes: Routes = [
  { path: '', component: ActivityLogsListComponent },
  { path: 'login', component: ActivityLogsListComponent },
  { path: 'audit', component: ActivityLogsListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityLogsRoutingModule { }