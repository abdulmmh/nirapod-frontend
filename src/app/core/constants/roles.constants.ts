export enum Role {
  SUPER_ADMIN         = 'SUPER_ADMIN',
  TAX_COMMISSIONER    = 'TAX_COMMISSIONER',
  TAX_OFFICER         = 'TAX_OFFICER',
  AUDITOR             = 'AUDITOR',
  TAXPAYER            = 'TAXPAYER',
  DATA_ENTRY_OPERATOR = 'DATA_ENTRY_OPERATOR',
  GUEST               = 'GUEST'
}

// ── Permission map per role ──
export const ROLE_PERMISSIONS: Record<Role, string[]> = {

  [Role.SUPER_ADMIN]: ['*'], // full access

  [Role.TAX_COMMISSIONER]: [
    'dashboard', 'taxpayers', 'businesses', 'tin', 'vat-registration',
    'vat-returns', 'income-tax', 'payments', 'refunds', 'penalties',
    'audits', 'documents', 'notices', 'reports', 'activity-logs'
  ],

  [Role.TAX_OFFICER]: [
    'dashboard', 'taxpayers', 'businesses', 'tin', 'vat-registration',
    'vat-returns', 'income-tax', 'payments', 'notices', 'documents'
  ],

  [Role.AUDITOR]: [
    'dashboard', 'audits', 'taxpayers', 'businesses',
    'vat-returns', 'income-tax', 'documents', 'reports', 'notices'
  ],

  [Role.DATA_ENTRY_OPERATOR]: [
    'dashboard', 'taxpayers', 'businesses', 'tin',
    'vat-registration', 'vat-returns', 'income-tax', 'payments'
  ],

  [Role.TAXPAYER]: [
    'dashboard', 'my-profile', 'vat-returns', 'income-tax',
    'payments', 'notices', 'refunds'
  ],

  [Role.GUEST]: ['dashboard']
};

// ── Button-level permissions ──
export const ROLE_ACTIONS: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]:         ['create', 'edit', 'delete', 'view', 'export', 'manage-users'],
  [Role.TAX_COMMISSIONER]:    ['create', 'edit', 'delete', 'view', 'export'],
  [Role.TAX_OFFICER]:         ['create', 'edit', 'view'],
  [Role.AUDITOR]:             ['view', 'export'],
  [Role.DATA_ENTRY_OPERATOR]: ['create', 'edit', 'view'],
  [Role.TAXPAYER]:            ['view', 'create'],
  [Role.GUEST]:               ['view']
};

// ── Sidebar menu visibility per role ──
export const ROLE_MENU: Record<Role, string[]> = {

  [Role.SUPER_ADMIN]: [
    'Dashboard', 'Taxpayer Management', 'Business Registration',
    'TIN Management', 'VAT Registration', 'VAT Returns',
    'Income Tax Returns', 'Payments', 'Refund Management',
    'Penalty & Fines', 'Audit Management', 'Document Verification',
    'Notices & Notifications', 'Reports & Analytics',
    'User Management', 'Roles & Permissions',
    'Activity Logs', 'System Settings'
  ],

  [Role.TAX_COMMISSIONER]: [
    'Dashboard', 'Taxpayer Management', 'Business Registration',
    'TIN Management', 'VAT Registration', 'VAT Returns',
    'Income Tax Returns', 'Payments', 'Refund Management',
    'Penalty & Fines', 'Audit Management', 'Document Verification',
    'Notices & Notifications', 'Reports & Analytics', 'Activity Logs'
  ],

  [Role.TAX_OFFICER]: [
    'Dashboard', 'Taxpayer Management', 'Business Registration',
    'TIN Management', 'VAT Registration', 'VAT Returns',
    'Income Tax Returns', 'Payments', 'Document Verification',
    'Notices & Notifications'
  ],

  [Role.AUDITOR]: [
    'Dashboard', 'Audit Management', 'Taxpayer Management',
    'Business Registration', 'VAT Returns', 'Income Tax Returns',
    'Document Verification', 'Reports & Analytics', 'Notices & Notifications'
  ],

  [Role.DATA_ENTRY_OPERATOR]: [
    'Dashboard', 'Taxpayer Management', 'Business Registration',
    'TIN Management', 'VAT Registration', 'VAT Returns',
    'Income Tax Returns', 'Payments'
  ],

  [Role.TAXPAYER]: [
    'Dashboard', 'VAT Returns', 'Income Tax Returns',
    'Payments', 'Refund Management', 'Notices & Notifications'
  ],

  [Role.GUEST]: ['Dashboard']
};