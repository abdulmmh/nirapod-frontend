import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsDashboardComponent } from '../pages/reports-dashboard/reports-dashboard.component';

const routes: Routes = [
  { path: '', component: ReportsDashboardComponent },
  { path: 'tax', component: ReportsDashboardComponent },
  { path: 'audit', component: ReportsDashboardComponent },
  { path: 'export', component: ReportsDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }