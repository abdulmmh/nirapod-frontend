import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { Role } from 'src/app/core/constants/roles.constants';
import { TaxableProductListComponent }   from '../pages/taxable-product-list/taxable-product-list.component';
import { TaxableProductCreateComponent } from '../pages/taxable-product-create/taxable-product-create.component';
import { TaxableProductViewComponent } from '../pages/taxable-product-view/taxable-product-view.component';
import { TaxableProductEditComponent } from '../pages/taxable-product-edit/taxable-product-edit.component';

const routes: Routes = [
  { path: '', component: TaxableProductListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: TaxableProductCreateComponent, canActivate: [AuthGuard] },
  { path: 'view/:id', component: TaxableProductViewComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: TaxableProductEditComponent, canActivate: [AuthGuard],
    data: { roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxableProductsRoutingModule { }