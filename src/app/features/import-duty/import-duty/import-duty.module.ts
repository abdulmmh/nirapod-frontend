import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ImportDutyRoutingModule } from './import-duty-routing.module';
import { ImportDutyListComponent }   from '../pages/import-duty-list/import-duty-list.component';
import { ImportDutyCreateComponent } from '../pages/import-duty-create/import-duty-create.component';
import { ImportDutyViewComponent } from '../pages/import-duty-view/import-duty-view.component';
import { ImportDutyEditComponent } from '../pages/import-duty-edit/import-duty-edit.component';

@NgModule({
  declarations: [
    ImportDutyListComponent, 
    ImportDutyCreateComponent,
    ImportDutyEditComponent,
    ImportDutyViewComponent 
  ],
  imports: [
    CommonModule, 
    FormsModule, 
    SharedModule, 
    ImportDutyRoutingModule]
})
export class ImportDutyModule { }