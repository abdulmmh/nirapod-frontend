import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TaxStructureRoutingModule } from './tax-structure-routing.module';
import { TaxStructureListComponent }   from '../pages/tax-structure-list/tax-structure-list.component';
import { TaxStructureCreateComponent } from '../pages/tax-structure-create/tax-structure-create.component';
import { TaxStructureViewComponent }   from '../pages/tax-structure-view/tax-structure-view.component';
import { TaxStructureEditComponent }   from '../pages/tax-structure-edit/tax-structure-edit.component';

@NgModule({
  declarations: [
    TaxStructureListComponent,
    TaxStructureCreateComponent,
    TaxStructureViewComponent,
    TaxStructureEditComponent
  ],
  imports: [CommonModule, FormsModule, SharedModule, TaxStructureRoutingModule]
})
export class TaxStructureModule { }