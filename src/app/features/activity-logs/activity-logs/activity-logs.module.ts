import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ActivityLogsRoutingModule } from './activity-logs-routing.module';
import { ActivityLogsListComponent } from '../pages/activity-logs-list/activity-logs-list.component';

@NgModule({
  declarations: [ActivityLogsListComponent],
  imports: [CommonModule, FormsModule, SharedModule, ActivityLogsRoutingModule]
})
export class ActivityLogsModule { }