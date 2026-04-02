// import { Component, HostListener } from '@angular/core';

// @Component({
//   selector: 'app-main-layout',
//   templateUrl: './main-layout.component.html',
//   styleUrls: ['./main-layout.component.css']
// })
// export class MainLayoutComponent {

//   isSidebarCollapsed  = false;
//   isMobileDrawerOpen  = false;
//   isMobileView        = false;

//   constructor() {
//     this.checkMobile();
//   }

//   @HostListener('window:resize')
//   checkMobile(): void {
//     this.isMobileView = window.innerWidth <= 768;
//     // Auto close drawer on desktop resize
//     if (!this.isMobileView) {
//       this.isMobileDrawerOpen = false;
//     }
//   }

//   toggleSidebar(): void {
//     if (this.isMobileView) {
//       this.isMobileDrawerOpen = !this.isMobileDrawerOpen;
//     } else {
//       this.isSidebarCollapsed = !this.isSidebarCollapsed;
//     }
//   }

//   closeDrawer(): void {
//     this.isMobileDrawerOpen = false;
//   }
// }

import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {

  isSidebarCollapsed  = false;
  isMobileDrawerOpen  = false;
  isMobileView        = false;

  ngOnInit(): void {
    this.checkMobile();
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobileView = window.innerWidth <= 768;
    // Auto close drawer on desktop resize
    if (!this.isMobileView) {
      this.isMobileDrawerOpen = false;
      // Reset collapsed state when switching back to desktop
      // so sidebar is always visible on desktop
    }
  }

  toggleSidebar(): void {
    if (this.isMobileView) {
      // Mobile: drawer open/close
      this.isMobileDrawerOpen = !this.isMobileDrawerOpen;
    } else {
      // Desktop: collapse/expand
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeDrawer(): void {
    this.isMobileDrawerOpen = false;
  }
}