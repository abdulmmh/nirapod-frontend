import { Component } from '@angular/core';

interface Permission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
}

interface RoleConfig {
  role: string;
  label: string;
  color: string;
  description: string;
  userCount: number;
  permissions: Permission[];
}

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.css']
})
export class RolesListComponent {

  selectedRole = 'TAX_OFFICER';

  roles: RoleConfig[] = [
    {
      role: 'SUPER_ADMIN', label: 'Super Admin', color: 'super',
      description: 'Full system access — all modules, settings and user management',
      userCount: 1,
      permissions: [
        { module: 'Taxpayer Management', create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Business Registration', create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'TIN Management',       create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'VAT Registration',     create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'VAT Returns',          create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Income Tax Returns',   create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Payments',             create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Refund Management',    create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Penalty & Fines',      create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Audit Management',     create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Tax Structure',        create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Import Duty',          create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'AIT',                  create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'User Management',      create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'System Settings',      create: true,  read: true,  update: true,  delete: true,  export: true  },
      ]
    },
    {
      role: 'TAX_COMMISSIONER', label: 'Tax Commissioner', color: 'commissioner',
      description: 'High-level access — approve, configure taxes and oversee all returns',
      userCount: 3,
      permissions: [
        { module: 'Taxpayer Management',  create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Business Registration',create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'TIN Management',       create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'VAT Registration',     create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'VAT Returns',          create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Income Tax Returns',   create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Payments',             create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'Refund Management',    create: false, read: true,  update: true,  delete: false, export: true  },
        { module: 'Penalty & Fines',      create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Audit Management',     create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Tax Structure',        create: true,  read: true,  update: true,  delete: true,  export: true  },
        { module: 'Import Duty',          create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'AIT',                  create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'User Management',      create: false, read: true,  update: false, delete: false, export: false },
        { module: 'System Settings',      create: false, read: true,  update: false, delete: false, export: false },
      ]
    },
    {
      role: 'TAX_OFFICER', label: 'Tax Officer', color: 'officer',
      description: 'Operational access — process returns, registrations and assessments',
      userCount: 12,
      permissions: [
        { module: 'Taxpayer Management',  create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Business Registration',create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'TIN Management',       create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'VAT Registration',     create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'VAT Returns',          create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Income Tax Returns',   create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Payments',             create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Refund Management',    create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Penalty & Fines',      create: true,  read: true,  update: false, delete: false, export: false },
        { module: 'Audit Management',     create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Tax Structure',        create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Import Duty',          create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'AIT',                  create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'User Management',      create: false, read: false, update: false, delete: false, export: false },
        { module: 'System Settings',      create: false, read: false, update: false, delete: false, export: false },
      ]
    },
    {
      role: 'AUDITOR', label: 'Auditor', color: 'auditor',
      description: 'Audit and compliance access — view all records and conduct audits',
      userCount: 6,
      permissions: [
        { module: 'Taxpayer Management',  create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'Business Registration',create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'TIN Management',       create: false, read: true,  update: false, delete: false, export: false },
        { module: 'VAT Registration',     create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'VAT Returns',          create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'Income Tax Returns',   create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'Payments',             create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'Refund Management',    create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Penalty & Fines',      create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'Audit Management',     create: true,  read: true,  update: true,  delete: false, export: true  },
        { module: 'Tax Structure',        create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Import Duty',          create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'AIT',                  create: false, read: true,  update: false, delete: false, export: true  },
        { module: 'User Management',      create: false, read: false, update: false, delete: false, export: false },
        { module: 'System Settings',      create: false, read: false, update: false, delete: false, export: false },
      ]
    },
    {
      role: 'DATA_ENTRY_OPERATOR', label: 'Data Entry', color: 'data',
      description: 'Data entry access — create and update records, no deletion',
      userCount: 8,
      permissions: [
        { module: 'Taxpayer Management',  create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'Business Registration',create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'TIN Management',       create: true,  read: true,  update: false, delete: false, export: false },
        { module: 'VAT Registration',     create: true,  read: true,  update: false, delete: false, export: false },
        { module: 'VAT Returns',          create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'Income Tax Returns',   create: true,  read: true,  update: true,  delete: false, export: false },
        { module: 'Payments',             create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Refund Management',    create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Penalty & Fines',      create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Audit Management',     create: false, read: false, update: false, delete: false, export: false },
        { module: 'Tax Structure',        create: false, read: true,  update: false, delete: false, export: false },
        { module: 'Import Duty',          create: true,  read: true,  update: false, delete: false, export: false },
        { module: 'AIT',                  create: true,  read: true,  update: false, delete: false, export: false },
        { module: 'User Management',      create: false, read: false, update: false, delete: false, export: false },
        { module: 'System Settings',      create: false, read: false, update: false, delete: false, export: false },
      ]
    },
  ];

  get selectedRoleConfig(): RoleConfig {
    return this.roles.find(r => r.role === this.selectedRole) || this.roles[0];
  }

  getRoleColorClass(color: string): string {
    return 'role-' + color;
  }

  countPermissions(role: RoleConfig): number {
    return role.permissions.reduce((sum, p) =>
      sum + [p.create, p.read, p.update, p.delete, p.export].filter(Boolean).length, 0);
  }
}