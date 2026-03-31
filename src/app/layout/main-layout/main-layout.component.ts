import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {

  isSidebarCollapsed  = false;
  isMobileDrawerOpen  = false;
  isMobileView        = false;

  constructor() {
    this.checkMobile();
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobileView = window.innerWidth <= 768;
    // Auto close drawer on desktop resize
    if (!this.isMobileView) {
      this.isMobileDrawerOpen = false;
    }
  }

  toggleSidebar(): void {
    if (this.isMobileView) {
      this.isMobileDrawerOpen = !this.isMobileDrawerOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeDrawer(): void {
    this.isMobileDrawerOpen = false;
  }
}