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
import { UnauthorizedComponent } from './features/auth/pages/unauthorized/unauthorized.component';

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
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { VerifyEmailComponent } from './features/auth/pages/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { VerifyOtpComponent } from './features/auth/pages/verify-otp/verify-otp.component';
import { PortalAuditDetailComponent } from './features/taxpayer-portal/pages/portal-audit-detail/portal-audit-detail.component';
import { PortalAuditListComponent } from './features/taxpayer-portal/pages/portal-audit-list/portal-audit-list.component';

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
    UnauthorizedComponent,

    // Dashboard
    DashboardHomeComponent,

    // Other Features
    ReportsHomeComponent,
    SettingsHomeComponent,
    ResetPasswordComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    VerifyOtpComponent,
    PortalAuditDetailComponent,
    PortalAuditListComponent,


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