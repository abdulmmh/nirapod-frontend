import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  private routeLabels: { [key: string]: string } = {
    'dashboard':      'Dashboard',
    'taxpayers':      'Taxpayer Management',
    'create':         'Create New',
    'businesses':     'Business Registration',
    'tin':            'TIN Management',
    'vat-registration': 'VAT Registration (BIN)',
    'vat-returns':    'VAT Returns',
    'income-tax':     'Income Tax Returns',
    'payments':       'Payments',
    'refunds':        'Refund Management',
    'penalties':      'Penalty & Fines',
    'audits':         'Audit Management',
    'documents':      'Document Verification',
    'notices':        'Notices & Notifications',
    'reports':        'Reports & Analytics',
    'users':          'User Management',
    'roles':          'Roles & Permissions',
    'activity-logs':  'Activity Logs',
    'settings':       'System Settings'
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.buildBreadcrumbs();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.buildBreadcrumbs());
  }

  private buildBreadcrumbs(): void {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s.length > 0);

    this.breadcrumbs = [{ label: 'Home', url: '/dashboard' }];

    let currentUrl = '';
    segments.forEach(segment => {
      currentUrl += '/' + segment;
      const label = this.routeLabels[segment] || this.toTitleCase(segment);
      this.breadcrumbs.push({ label, url: currentUrl });
    });
  }

  private toTitleCase(str: string): string {
    return str.replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  get pageTitle(): string {
    if (this.breadcrumbs.length > 1) {
      return this.breadcrumbs[this.breadcrumbs.length - 1].label;
    }
    return 'Dashboard';
  }
}