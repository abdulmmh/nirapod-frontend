import { Component, EventEmitter, Input, OnInit, Output, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

interface ChildMenuItem {
  label: string;
  route: string;
  icon: string;
}

interface MenuItem {
  label: string;
  route: string | null;
  icon: string;
  children: ChildMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input()  isCollapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();

  openMenu:    string | null = null;
  activeflyout: string | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard',               route: '/dashboard',       icon: 'bi bi-grid-1x2-fill',          children: [] },
    { label: 'Taxpayer Management',     route: null,               icon: 'bi bi-people-fill',            children: [
      { label: 'Taxpayer List', route: '/taxpayers',        icon: 'bi bi-list-ul' },
      { label: 'Add Taxpayer',  route: '/taxpayers/create', icon: 'bi bi-person-plus-fill' }
    ]},
    { label: 'Business Registration',   route: null,               icon: 'bi bi-building-fill',          children: [
      { label: 'Business List', route: '/businesses',        icon: 'bi bi-list-ul' },
      { label: 'Add Business',  route: '/businesses/create', icon: 'bi bi-plus-circle-fill' }
    ]},
    { label: 'TIN Management',          route: null,               icon: 'bi bi-upc-scan',               children: [
      { label: 'TIN List',  route: '/tin',        icon: 'bi bi-list-ul' },
      { label: 'Issue TIN', route: '/tin/create', icon: 'bi bi-plus-circle-fill' }
    ]},
    { label: 'VAT Registration',        route: null,               icon: 'bi bi-file-earmark-text-fill', children: [
      { label: 'BIN List',     route: '/vat-registration',        icon: 'bi bi-list-ul' },
      { label: 'Register BIN', route: '/vat-registration/create', icon: 'bi bi-plus-circle-fill' }
    ]},
    { label: 'VAT Returns',             route: null,               icon: 'bi bi-arrow-repeat',           children: [
      { label: 'VAT Return List', route: '/vat-returns',        icon: 'bi bi-list-ul' },
      { label: 'Submit Return',   route: '/vat-returns/create', icon: 'bi bi-upload' }
    ]},
    { label: 'Income Tax Returns',      route: null,               icon: 'bi bi-receipt-cutoff',         children: [
      { label: 'IT Return List', route: '/income-tax',        icon: 'bi bi-list-ul' },
      { label: 'Submit Return',  route: '/income-tax/create', icon: 'bi bi-upload' }
    ]},
    { label: 'Payments',                route: null,               icon: 'bi bi-credit-card-fill',       children: [
      { label: 'Payment List', route: '/payments',        icon: 'bi bi-list-ul' },
      { label: 'Add Payment',  route: '/payments/create', icon: 'bi bi-plus-circle-fill' }
    ]},
    { label: 'Refund Management',       route: null,               icon: 'bi bi-cash-stack',             children: [
      { label: 'Refund List', route: '/refunds',        icon: 'bi bi-list-ul' },
      { label: 'New Refund',  route: '/refunds/create', icon: 'bi bi-plus-circle-fill' }
    ]},
    { label: 'Penalty & Fines',         route: null,               icon: 'bi bi-exclamation-triangle-fill', children: [
      { label: 'Penalty List',  route: '/penalties',        icon: 'bi bi-list-ul' },
      { label: 'Issue Penalty', route: '/penalties/create', icon: 'bi bi-plus-circle-fill' }
    ]},
    { label: 'Audit Management',        route: null,               icon: 'bi bi-shield-fill-check',      children: [
      { label: 'Audit List',   route: '/audits',        icon: 'bi bi-list-ul' },
      { label: 'Create Audit', route: '/audits/create', icon: 'bi bi-plus-circle-fill' }
    ]},
    
    { label: 'Document Verification',   route: '/documents',       icon: 'bi bi-patch-check-fill',       children: [] },
    { label: 'Notices & Notifications', route: '/notices',         icon: 'bi bi-bell-fill',              children: [] },
    { label: 'Reports & Analytics',     route: '/reports',         icon: 'bi bi-bar-chart-fill',         children: [] },
    { label: 'User Management',         route: '/users',           icon: 'bi bi-person-gear',            children: [] },
    { label: 'Roles & Permissions',     route: '/roles',           icon: 'bi bi-lock-fill',              children: [] },
    { label: 'Activity Logs',           route: '/activity-logs',   icon: 'bi bi-clock-history',          children: [] },
    { label: 'System Settings',         route: '/settings',        icon: 'bi bi-gear-fill',              children: [] },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.menuItems.forEach(item => {
      if (item.children.some(c => this.router.url.startsWith(c.route))) {
        this.openMenu = item.label;
      }
    });
  }

  get visibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item =>
      this.authService.canSeeMenu(item.label)
    );
  }

  // Expanded mode submenu toggle
  toggleMenu(label: string): void {
    this.openMenu = this.openMenu === label ? null : label;
  }

  // Collapsed mode flyout toggle on click
  toggleFlyout(label: string, event: Event): void {
    event.stopPropagation();
    this.activeflyout = this.activeflyout === label ? null : label;
  }

  closeFlyout(): void {
    this.activeflyout = null;
  }

  // Close flyout when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeflyout = null;
    }
  }
}