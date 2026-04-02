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
import { SettingsHomeComponent } from './features/system-settings/pages/settings-home/settings-home.component';

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
    SettingsHomeComponent,






  



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