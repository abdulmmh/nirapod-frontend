import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

import { TaxStructureRoutingModule } from 'src/app/features/tax-structure/tax-structure/tax-structure-routing.module';
import { TaxStructureListComponent }   from '../pages/tax-structure-list/tax-structure-list.component';
import { TaxStructureCreateComponent } from '../pages/tax-structure-create/tax-structure-create.component';

@NgModule({
  declarations: [
      TaxStructureListComponent,
     TaxStructureCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    TaxStructureRoutingModule
  ]
})
export class TaxStructureModule { }