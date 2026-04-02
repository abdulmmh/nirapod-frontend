import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from '../pages/settings/settings.component';

@NgModule({
  declarations: [SettingsComponent],
  imports: [CommonModule, FormsModule, SharedModule, SettingsRoutingModule]
})
export class SettingsModule { }