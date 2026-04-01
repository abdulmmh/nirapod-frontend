import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/constants/roles.constants';

interface MenuItem {
  label: string;
  icon?: string;
  route?: string | null;
  roles?: Role[];
  children?: MenuItem[];
  isGroupHeader?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;

  activeRoute = '';
  activeFlyout = '';
  expandedItems: string[] = [];

  Role = Role;

  menuItems: MenuItem[] = [
    { label: 'MAIN NAVIGATION', isGroupHeader: true },

    {
      label: 'Dashboard',
      icon: 'bi bi-grid-fill',
      route: '/dashboard',
      roles: []
    },
    {
      label: 'Taxpayer Management',
      icon: 'bi bi-people-fill',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR, Role.SUPER_ADMIN],
      children: [
        { label: 'All Taxpayers', route: '/taxpayers', icon: 'bi bi-list-ul' },
        { label: 'Add Taxpayer', route: '/taxpayers/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Business Registration',
      icon: 'bi bi-building-fill',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR, Role.SUPER_ADMIN],
      children: [
        { label: 'All Businesses', route: '/businesses', icon: 'bi bi-list-ul' },
        { label: 'Register Business', route: '/businesses/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'TIN Management',
      icon: 'bi bi-upc-scan',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR, Role.SUPER_ADMIN],
      children: [
        { label: 'All TIN Records', route: '/tin', icon: 'bi bi-list-ul' },
        { label: 'Issue TIN', route: '/tin/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'VAT Registration',
      icon: 'bi bi-receipt-cutoff',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.DATA_ENTRY_OPERATOR, Role.SUPER_ADMIN],
      children: [
        { label: 'All VAT Registrations', route: '/vat-registration', icon: 'bi bi-list-ul' },
        { label: 'Register VAT', route: '/vat-registration/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'VAT Returns',
      icon: 'bi bi-arrow-repeat',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.TAXPAYER, Role.DATA_ENTRY_OPERATOR, Role.SUPER_ADMIN],
      children: [
        { label: 'All VAT Returns', route: '/vat-returns', icon: 'bi bi-list-ul' },
        { label: 'File Return', route: '/vat-returns/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Income Tax Returns',
      icon: 'bi bi-file-earmark-text-fill',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.TAXPAYER, Role.DATA_ENTRY_OPERATOR, Role.SUPER_ADMIN],
      children: [
        { label: 'All IT Returns', route: '/income-tax-returns', icon: 'bi bi-list-ul' },
        { label: 'File Return', route: '/income-tax-returns/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Payments',
      icon: 'bi bi-credit-card-fill',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.TAXPAYER, Role.SUPER_ADMIN],
      children: [
        { label: 'Payment List', route: '/payments', icon: 'bi bi-list-ul' },
        { label: 'Add Payment', route: '/payments/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Refund Management',
      icon: 'bi bi-cash-stack',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.TAXPAYER, Role.SUPER_ADMIN],
      children: [
        { label: 'All Refunds', route: '/refunds', icon: 'bi bi-list-ul' },
        { label: 'New Refund', route: '/refunds/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Penalty & Fines',
      icon: 'bi bi-exclamation-triangle-fill',
      route: null,
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.SUPER_ADMIN],
      children: [
        { label: 'All Penalties', route: '/penalties', icon: 'bi bi-list-ul' },
        { label: 'Issue Penalty', route: '/penalties/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Audit Management',
      icon: 'bi bi-shield-fill-check',
      route: null,
      roles: [Role.AUDITOR, Role.TAX_COMMISSIONER, Role.SUPER_ADMIN],
      children: [
        { label: 'All Audits', route: '/audits', icon: 'bi bi-list-ul' },
        { label: 'Create Audit', route: '/audits/create', icon: 'bi bi-plus-circle' }
      ]
    },

    { label: 'TAX CONFIGURATION', isGroupHeader: true },

    {
      label: 'Tax Structure',
      icon: 'bi bi-sliders',
      route: null,
      roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER],
      children: [
        { label: 'All Tax Structures', route: '/tax-structure', icon: 'bi bi-list-ul' },
        { label: 'Add Tax Structure', route: '/tax-structure/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Taxable Products',
      icon: 'bi bi-box-seam-fill',
      route: null,
      roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.TAX_OFFICER],
      children: [
        { label: 'All Products', route: '/taxable-products', icon: 'bi bi-list-ul' },
        { label: 'Add Product', route: '/taxable-products/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Import Duty',
      icon: 'bi bi-truck-front-fill',
      route: null,
      roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.TAX_OFFICER],
      children: [
        { label: 'Import Records', route: '/import-duty', icon: 'bi bi-list-ul' },
        { label: 'New Import', route: '/import-duty/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'AIT',
      icon: 'bi bi-percent',
      route: null,
      roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.TAX_OFFICER],
      children: [
        { label: 'AIT Records', route: '/ait', icon: 'bi bi-list-ul' },
        { label: 'New AIT', route: '/ait/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Fiscal Years',
      icon: 'bi bi-calendar-range-fill',
      route: null,
      roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER],
      children: [
        { label: 'All Fiscal Years', route: '/fiscal-years', icon: 'bi bi-list-ul' },
        { label: 'Add Fiscal Year', route: '/fiscal-years/create', icon: 'bi bi-plus-circle' }
      ]
    },
    
    {
      label: 'Document Verification',
      icon: 'bi bi-file-earmark-check-fill',
      route: '/documents',
      roles: [Role.TAX_OFFICER, Role.TAX_COMMISSIONER, Role.AUDITOR, Role.DATA_ENTRY_OPERATOR, Role.SUPER_ADMIN]
    },
    {
      label: 'Notices & Notifications',
      icon: 'bi bi-bell-fill',
      route: '/notices',
      roles: []
    },
    // ── ADMINISTRATION ──
    { label: 'ADMINISTRATION', isGroupHeader: true },

    {
      label: 'Reports & Analytics',
      icon: 'bi bi-bar-chart-fill',
      route: null,
      roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER, Role.AUDITOR],
      children: [
        { label: 'Dashboard Reports', route: '/reports',              icon: 'bi bi-pie-chart-fill' },
        { label: 'Tax Collection',    route: '/reports/tax',          icon: 'bi bi-cash-stack' },
        { label: 'Audit Reports',     route: '/reports/audit',        icon: 'bi bi-shield-fill-check' },
        { label: 'Export Reports',    route: '/reports/export',       icon: 'bi bi-download' }
      ]
    },
    {
      label: 'User Management',
      icon: 'bi bi-person-gear',
      route: null,
      roles: [Role.SUPER_ADMIN],
      children: [
        { label: 'All Users',    route: '/users',        icon: 'bi bi-list-ul' },
        { label: 'Add User',     route: '/users/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Roles & Permissions',
      icon: 'bi bi-lock-fill',
      route: '/roles',
      roles: [Role.SUPER_ADMIN],
      children: [
        { label: 'All Roles',   route: '/roles',        icon: 'bi bi-list-ul' },
        { label: 'Add Role',    route: '/roles/create', icon: 'bi bi-plus-circle' }
      ]
    },
    {
      label: 'Activity Logs',
      icon: 'bi bi-clock-history',
      route: '/activity-logs',
      roles: [Role.SUPER_ADMIN, Role.TAX_COMMISSIONER],
      children: [
        { label: 'All Logs',    route: '/activity-logs',         icon: 'bi bi-list-ul' },
        { label: 'Login Logs',  route: '/activity-logs/login',   icon: 'bi bi-box-arrow-in-right' },
        { label: 'Audit Trail', route: '/activity-logs/audit',   icon: 'bi bi-shield-fill-check' }
      ]
    },
    {
      label: 'System Settings',
      icon: 'bi bi-gear-fill',
      route: null,
      roles: [Role.SUPER_ADMIN],
      children: [
        { label: 'General Settings', route: '/settings',              icon: 'bi bi-sliders' },
        { label: 'Email Config',     route: '/settings/email',        icon: 'bi bi-envelope-fill' },
        { label: 'Backup & Restore', route: '/settings/backup',       icon: 'bi bi-cloud-arrow-up-fill' },
        { label: 'System Info',      route: '/settings/info',         icon: 'bi bi-info-circle-fill' }
      ]
    }
  ];

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.activeRoute = this.router.url;
    this.autoExpandActive();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.urlAfterRedirects;
        this.autoExpandActive();
      });
  }

  private autoExpandActive(): void {
    this.menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          child => !!child.route && this.activeRoute.startsWith(child.route)
        );

        if (hasActiveChild && !this.expandedItems.includes(item.label)) {
          this.expandedItems.push(item.label);
        }
      }
    });
  }

  get visibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => {
      if (item.isGroupHeader) {
        return true;
      }

      if (!item.roles || item.roles.length === 0) {
        return true;
      }

      return item.roles.some(role => this.authService.hasRole(role));
    });
  }

  toggleExpand(label: string): void {
    if (this.expandedItems.includes(label)) {
      this.expandedItems = this.expandedItems.filter(item => item !== label);
    } else {
      this.expandedItems.push(label);
    }
  }

  isExpanded(label: string): boolean {
    return this.expandedItems.includes(label);
  }

  isActive(route: string | null | undefined): boolean {
    if (!route) {
      return false;
    }

    return this.activeRoute === route || this.activeRoute.startsWith(route + '/');
  }

  isParentActive(item: MenuItem): boolean {
    if (!item.children) {
      return false;
    }

    return item.children.some(child => child.route && this.isActive(child.route));
  }

  toggleFlyout(label: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.activeFlyout = this.activeFlyout === label ? '' : label;
  }

  navigate(route: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.router.navigate([route]);
    this.activeFlyout = '';
  }
}