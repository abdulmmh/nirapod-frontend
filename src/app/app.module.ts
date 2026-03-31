import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';

// Interceptor
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Auth
import { LoginComponent } from './features/auth/pages/login/login.component';

// Layout
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { BreadcrumbsComponent } from './layout/breadcrumbs/breadcrumbs.component';

// Dashboard
import { DashboardHomeComponent } from './features/dashboard/pages/dashboard-home/dashboard-home.component';

// Other Features
import { ReportsHomeComponent } from './features/reports-analytics/pages/reports-home/reports-home.component';
import { UserListComponent } from './features/user-management/pages/user-list/user-list.component';
import { SettingsHomeComponent } from './features/system-settings/pages/settings-home/settings-home.component';
import { ActivityLogListComponent } from './features/activity-logs/pages/activity-log-list/activity-log-list.component';
import { FiscalYearListComponent } from './features/fiscal-years/pages/fiscal-year-list/fiscal-year-list.component';
import { FiscalYearCreateComponent } from './features/fiscal-years/pages/fiscal-year-create/fiscal-year-create.component';
import { AitListComponent } from './features/ait/pages/ait-list/ait-list.component';
import { AitCreateComponent } from './features/ait/pages/ait-create/ait-create.component';
import { ImportDutyListComponent } from './features/import-duty/pages/import-duty-list/import-duty-list.component';
import { ImportDutyCreateComponent } from './features/import-duty/pages/import-duty-create/import-duty-create.component';
import { TaxableProductListComponent } from './features/taxable-products/pages/taxable-product-list/taxable-product-list.component';
import { TaxableProductCreateComponent } from './features/taxable-products/pages/taxable-product-create/taxable-product-create.component';
import { TaxStructureListComponent } from './features/tax-structure/pages/tax-structure-list/tax-structure-list.component';
import { TaxStructureCreateComponent } from './features/tax-structure/pages/tax-structure-create/tax-structure-create.component';



@NgModule({
  declarations: [
    AppComponent,

    // Layout
    MainLayoutComponent,
    SidebarComponent,
    TopbarComponent,
    FooterComponent,
    BreadcrumbsComponent,

    // Auth
    LoginComponent,

    // Dashboard
    DashboardHomeComponent,

    // Other Features
    ReportsHomeComponent,
    UserListComponent,
    SettingsHomeComponent,
    ActivityLogListComponent,
    FiscalYearListComponent,
    FiscalYearCreateComponent,
    AitListComponent,
    AitCreateComponent,
    ImportDutyListComponent,
    ImportDutyCreateComponent,
    TaxableProductListComponent,
    TaxableProductCreateComponent,
    TaxStructureListComponent,
    TaxStructureCreateComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
   bootstrap: [AppComponent]
})
export class AppModule { }