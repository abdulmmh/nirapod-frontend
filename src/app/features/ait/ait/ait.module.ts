import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { AitRoutingModule } from './ait-routing.module';

// Pages
import { AitDashboardComponent } from '../pages/ait-dashboard/ait-dashboard.component';
import { AitCreateWizardComponent } from '../pages/ait-create-wizard/ait-create-wizard.component';
import { OfficerDashboardComponent } from '../pages/officer-dashboard/officer-dashboard.component';
import { OfficerReviewComponent } from '../pages/officer-review/officer-review.component';
import { AuditTrailComponent } from '../components/audit-trail/audit-trail.component';
import { DocumentViewerComponent } from '../components/document-viewer/document-viewer.component';
import { KPICardsComponent } from '../components/kpi-cards/kpi-cards.component';
import { RecordsTableComponent } from '../components/records-table/records-table.component';
import { StatusBadgeComponent } from '../components/status-badge/status-badge.component';



@NgModule({
  declarations: [

    // Pages
    AitCreateWizardComponent,
    AitDashboardComponent,
    OfficerDashboardComponent,
    OfficerReviewComponent,

    // Components
    AuditTrailComponent,
    DocumentViewerComponent,
    KPICardsComponent,
    RecordsTableComponent,
    StatusBadgeComponent
    

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AitRoutingModule
  ]
})
export class AitModule { }