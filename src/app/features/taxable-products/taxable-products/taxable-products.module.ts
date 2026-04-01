import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TaxableProductsRoutingModule } from './taxable-products-routing.module';
import { TaxableProductListComponent }   from '../pages/taxable-product-list/taxable-product-list.component';
import { TaxableProductCreateComponent } from '../pages/taxable-product-create/taxable-product-create.component';

@NgModule({
  declarations: [
    TaxableProductListComponent, 
    TaxableProductCreateComponent
  ],
  imports: [
    CommonModule, 
    FormsModule, 
    SharedModule, 
    TaxableProductsRoutingModule
  ]
})
export class TaxableProductsModule { }