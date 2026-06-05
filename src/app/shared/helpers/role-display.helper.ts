export const ROLE_CLASS_MAP: Record<string, string> = {
  SUPER_ADMIN:         'role-super',
  TAX_COMMISSIONER:    'role-commissioner',
  TAX_OFFICER:         'role-officer',
  SUPERVISOR:          'role-supervisor',
  AUDITOR:             'role-auditor',
  DATA_ENTRY_OPERATOR: 'role-data',
  TAXPAYER:            'role-taxpayer',
  GUEST:               'role-guest',
};

export const ROLE_LABEL_MAP: Record<string, string> = {
  SUPER_ADMIN:         'Super Administrator',
  TAX_COMMISSIONER:    'Tax Commissioner',
  TAX_OFFICER:         'Tax Officer',
  SUPERVISOR:          'Supervisor',
  AUDITOR:             'Auditor',
  DATA_ENTRY_OPERATOR: 'Data Entry Operator',
  TAXPAYER:            'Taxpayer',
  GUEST:               'Guest',
};

export function getRoleClass(role: string): string {
  return ROLE_CLASS_MAP[role] ?? '';
}

export function getRoleLabel(role: string): string {
  return ROLE_LABEL_MAP[role] ?? role;
}

export function getStatusClass(status: string): string {
  if (status === 'Active')    return 'status-active';
  if (status === 'Suspended') return 'status-suspended';
  return 'status-inactive';
}

// Roles available in create/edit dropdowns.
// SUPER_ADMIN is intentionally excluded — it can only be assigned at the system level.
export const ASSIGNABLE_ROLES = [
  'TAX_COMMISSIONER',
  'TAX_OFFICER',
  'SUPERVISOR',
  'AUDITOR',
  'DATA_ENTRY_OPERATOR',
  'TAXPAYER',
  'GUEST',
];

export const DEPARTMENTS = [
  'IT Administration',
  'Tax Commission',
  'VAT Division',
  'Income Tax Division',
  'Audit Division',
  'Data Management',
  'External',
];