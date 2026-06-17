export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Dashboard
  DASHBOARD: {
    STATS: `${API_BASE_URL}/dashboard/stats`,
    RECENT_TAXPAYERS: `${API_BASE_URL}/dashboard/recent-taxpayers`,
    RECENT_PAYMENTS: `${API_BASE_URL}/dashboard/recent-payments`,
    VAT_CHART: `${API_BASE_URL}/dashboard/vat-chart`,
    PAYMENT_CHART: `${API_BASE_URL}/dashboard/payment-chart`,
    ZONE_VAT: `${API_BASE_URL}/dashboard/zone-vat`,
  },

  // Taxpayer
  TAXPAYERS: {
    LIST: `${API_BASE_URL}/taxpayers`,
    ME:   `${API_BASE_URL}/taxpayers/me`,
    CREATE: `${API_BASE_URL}/taxpayers`,
    UPDATE: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    GET: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    UPLOAD_PHOTO: (id: number) => `${API_BASE_URL}/taxpayers/${id}/photo`,
    GET_PHOTO: (id: number) => `${API_BASE_URL}/taxpayers/${id}/photo`,
    PENDING: `${API_BASE_URL}/taxpayers/pending`,
    APPROVE: (id: number) => `${API_BASE_URL}/taxpayers/${id}/approve`,
    REJECT: (id: number) => `${API_BASE_URL}/taxpayers/${id}/reject`,
    MY_APPLICATION: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    EXPORT: `${API_BASE_URL}/taxpayers/export`,
  },

  // Business
  BUSINESSES: {
    LIST:   `${API_BASE_URL}/businesses`,
    CREATE: `${API_BASE_URL}/businesses`,
    GET:    (id: number) => `${API_BASE_URL}/businesses/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    BY_TAXPAYER_VAT_STATUS: (taxpayerId: number) =>   // ← এটা add করো যদি না থাকে
      `${API_BASE_URL}/businesses/by-taxpayer/${taxpayerId}/vat-status`,
  },

  // TIN Management
  TINS: {
    LIST: `${API_BASE_URL}/tins`,
    CREATE: `${API_BASE_URL}/tins`,
    UPDATE: (id: number) => `${API_BASE_URL}/tins/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/tins/${id}`,
    GET: (id: number) => `${API_BASE_URL}/tins/${id}`,
    BY_TAXPAYER: (taxpayerId: number) =>
      `${API_BASE_URL}/tins/my-tin/${taxpayerId}`,
    EXPORT: `${API_BASE_URL}/tins/export`,
    BASE: `${API_BASE_URL}/tins`,
    DOWNLOAD_CERT: (id: number) => `${API_BASE_URL}/tins/${id}/certificate`,
  },

  // VAT Registration
  VAT_REGISTRATIONS: {
    LIST: `${API_BASE_URL}/vat-registrations`,
    CREATE: `${API_BASE_URL}/vat-registrations`,
    UPDATE: (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/vat-registrations/${id}/status`,
    UPLOAD_DOCUMENTS: (id: number) => `${API_BASE_URL}/vat-registrations/${id}/documents`,
    GET: (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
  },

  // VAT Returns
  VAT_RETURNS: {
    LIST: `${API_BASE_URL}/vat-returns`,
    CREATE: `${API_BASE_URL}/vat-returns`,
    UPDATE: (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
    GET: (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
  },

  // Income Tax Returns
  INCOME_TAX_RETURNS: {
    LIST: `${API_BASE_URL}/income-tax-returns`,
    CREATE: `${API_BASE_URL}/income-tax-returns`,
    PREVIEW: `${API_BASE_URL}/income-tax-returns/preview`,
    UPDATE: (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    GET: (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    UPDATE_STATUS: (id: number) =>
      `${API_BASE_URL}/income-tax-returns/${id}/status`,
    EXPORT: `${API_BASE_URL}/income-tax-returns/export`,
  },

  IT10B: {
    CREATE: `${API_BASE_URL}/it10b`,
    BY_RETURN: (returnId: number) =>
      `${API_BASE_URL}/it10b/by-return/${returnId}`,
    GET: (id: number) => `${API_BASE_URL}/it10b/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/it10b/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/it10b/${id}`,
  },

  // AIT (Advance Income Tax)
  AITS: {
    LIST: `${API_BASE_URL}/ait-records`,
    CREATE: `${API_BASE_URL}/ait-records`,
    UPDATE: (id: number) => `${API_BASE_URL}/ait-records/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/ait-records/${id}`,
    GET: (id: number) => `${API_BASE_URL}/ait-records/${id}`,
    DOCUMENTS: {
      LIST: (aitId: number) => `${API_BASE_URL}/ait-records/${aitId}/documents`,
      UPLOAD: (aitId: number) =>
        `${API_BASE_URL}/ait-records/${aitId}/documents`,
      DELETE: (aitId: number, docId: number) =>
        `${API_BASE_URL}/ait-records/${aitId}/documents/${docId}`,
      DOWNLOAD: (aitId: number, docId: number) =>
        `${API_BASE_URL}/ait-records/${aitId}/documents/${docId}/download`,
    },

    // Document requests
    DOC_REQUESTS: (id: number) =>
      `${API_BASE_URL}/ait-records/${id}/document-requests`,
    DOC_REQUESTS_PENDING: `${API_BASE_URL}/ait-records/document-requests/pending`,
    DOC_REQUESTS_OVERDUE: `${API_BASE_URL}/ait-records/document-requests/overdue`,
    DOC_REQUEST_FULFILL: (reqId: number) =>
      `${API_BASE_URL}/ait-records/document-requests/${reqId}/fulfill`,
    // Queue
    QUEUE_PENDING: `${API_BASE_URL}/ait-records/queue/pending`,
    QUEUE_MINE: `${API_BASE_URL}/ait-records/queue/mine`,

    BY_ID: (id: number) => `${API_BASE_URL}/ait-records/${id}`,
    CERTIFICATE: (id: number) =>
      `${API_BASE_URL}/ait-records/${id}/certificate`,

    // Workflow
    SUBMIT: (id: number) => `${API_BASE_URL}/ait-records/${id}/submit`,
    VERIFY_CHALLAN: (id: number) =>
      `${API_BASE_URL}/ait-records/${id}/verify-challan`,
    ASSIGN: (id: number) => `${API_BASE_URL}/ait-records/${id}/assign`,
    APPROVE: (id: number) => `${API_BASE_URL}/ait-records/${id}/approve`,
    REJECT: (id: number) => `${API_BASE_URL}/ait-records/${id}/reject`,
    RESUBMIT: (id: number) => `${API_BASE_URL}/ait-records/${id}/resubmit`,
    CREDIT: (id: number) => `${API_BASE_URL}/ait-records/${id}/credit`,
  },

  AIT_CREDIT_LEDGER: {
    MY: `${API_BASE_URL}/ait-credit-ledger/my`,
    MY_AVAILABLE: `${API_BASE_URL}/ait-credit-ledger/my/available`,
    MY_TOTAL: `${API_BASE_URL}/ait-credit-ledger/my/total`,
    BY_ID: (id: number) => `${API_BASE_URL}/ait-credit-ledger/${id}`,
    BY_TAXPAYER: (tpId: number) =>
      `${API_BASE_URL}/ait-credit-ledger/taxpayer/${tpId}`,
    APPLY: `${API_BASE_URL}/ait-credit-ledger/apply`,
    ITR_APPLICATIONS: (itrId: number) =>
      `${API_BASE_URL}/ait-credit-ledger/itr/${itrId}/applications`,
    ITR_TOTAL: (itrId: number) =>
      `${API_BASE_URL}/ait-credit-ledger/itr/${itrId}/total`,
  },

  // Fiscal Years
  FISCAL_YEARS: {
    LIST: `${API_BASE_URL}/fiscal-years`,
    ACTIVE: `${API_BASE_URL}/fiscal-years/active`,
    CREATE: `${API_BASE_URL}/fiscal-years`,
    UPDATE: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
    GET: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
  },

  // Import Duty
  IMPORT_DUTIES: {
    LIST: `${API_BASE_URL}/import-duty`,
    CREATE: `${API_BASE_URL}/import-duty`,
    GET: (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    PREVIEW: `${API_BASE_URL}/import-duty/preview-tax`,
  },

  // Certificate
  CERTIFICATES: {
    DOWNLOAD_TIN: (id: number) => `${API_BASE_URL}/tins/${id}/certificate`,
    DOWNLOAD_BIN: (id: number) =>
      `${API_BASE_URL}/vat-registrations/${id}/certificate`,
    TAX_CLEARANCE_LIST: `${API_BASE_URL}/tax-clearances`,
    DOWNLOAD_TAX_CLEARANCE: (id: number) =>
      `${API_BASE_URL}/tax-clearances/${id}/certificate`,
    PUBLIC_VERIFY: `${API_BASE_URL}/tax-clearances/public/verify`,
    DOWNLOAD_RETURN_ACK: (id: number) =>
      `${API_BASE_URL}/income-tax-returns/${id}/acknowledgment`,
  },

  // Payments
  PAYMENTS: {
    LIST: `${API_BASE_URL}/payments`,
    CREATE: `${API_BASE_URL}/payments`,
    GET: (id: number) => `${API_BASE_URL}/payments/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/payments/${id}`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/payments/${id}/status`,
    
    OUTSTANDING: (taxpayerId: number) =>
    `${API_BASE_URL}/payments/outstanding?taxpayerId=${taxpayerId}`,
  },
  

  // Notices & Notifications
  NOTICES: {
    LIST: `${API_BASE_URL}/notices`,
    MY: `${API_BASE_URL}/notices/my`, 
    CREATE: `${API_BASE_URL}/notices`,
    GET: (id: number) => `${API_BASE_URL}/notices/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/notices/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/notices/${id}`,
    READ: (id: number) => `${API_BASE_URL}/notices/${id}/read`,
    RESPOND:      (id: number) => `${API_BASE_URL}/notices/${id}/respond`, 
    UNREAD_COUNT: `${API_BASE_URL}/notices/my/unread-count`,
  },

  // Penalties & Fines
  PENALTIES: {
    LIST: `${API_BASE_URL}/penalties`,
    CREATE: `${API_BASE_URL}/penalties`,
    GET: (id: number) => `${API_BASE_URL}/penalties/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/penalties/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/penalties/${id}`,
    SUBMIT: (id: number) => `${API_BASE_URL}/penalties/${id}/submit`,
    APPROVE: (id: number) => `${API_BASE_URL}/penalties/${id}/approve`,
    REJECT: (id: number) => `${API_BASE_URL}/penalties/${id}/reject`,
    ISSUE: (id: number) => `${API_BASE_URL}/penalties/${id}/issue`,
    CANCEL: (id: number) => `${API_BASE_URL}/penalties/${id}/cancel`,
  },

  // Documents
  DOCUMENTS: {
    LIST: `${API_BASE_URL}/documents`,
    CREATE: `${API_BASE_URL}/documents`,
    GET: (id: number) => `${API_BASE_URL}/documents/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/documents/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/documents/${id}`,
  },

  // Audits
  AUDITS: {
    LIST: `${API_BASE_URL}/audits`,
    CREATE: `${API_BASE_URL}/audits`,
    GET: (id: number) => `${API_BASE_URL}/audits/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/audits/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/audits/${id}`,
    SEARCH: `${API_BASE_URL}/audits/search`,
    KPIS: `${API_BASE_URL}/audits/kpis`,
    STATUS: (id: number) => `${API_BASE_URL}/audits/${id}/status`,
    ISSUE_NOTICE: (id: number) => `${API_BASE_URL}/audits/${id}/issue-notice`,
    QUERIES: (id: number) => `${API_BASE_URL}/audits/${id}/queries`,
    FINDINGS: (id: number) => `${API_BASE_URL}/audits/${id}/findings`,
    DOC_REQUESTS: (id: number) =>
      `${API_BASE_URL}/audits/${id}/document-requests`,
    REQUEST_DOCS: (id: number) =>
      `${API_BASE_URL}/audits/${id}/request-documents`,
    ASSESSMENT: (id: number) => `${API_BASE_URL}/audits/${id}/assessment`,
    PROPOSE: (id: number) => `${API_BASE_URL}/audits/${id}/propose-assessment`,
    APPROVE: (id: number) => `${API_BASE_URL}/audits/${id}/approve-assessment`,
    DEMAND: (id: number) => `${API_BASE_URL}/audits/${id}/demand-notice`,
    ISSUE_DEMAND: (id: number) => `${API_BASE_URL}/audits/${id}/issue-demand`,

    // Taxpayer portal
    MY_LIST: `${API_BASE_URL}/my-portal/audits/my`,
    MY_GET: (id: number) => `${API_BASE_URL}/my-portal/audits/${id}`,
    MY_RESPOND: (id: number) =>
      `${API_BASE_URL}/my-portal/audits/${id}/respond`,
    MY_UPLOAD: (id: number) =>
      `${API_BASE_URL}/my-portal/audits/${id}/upload-documents`,
    MY_ASSESSMENT: (id: number) =>
      `${API_BASE_URL}/my-portal/audits/${id}/assessment`,
    MY_DEMAND: (id: number) =>
      `${API_BASE_URL}/my-portal/audits/${id}/demand-notice`,
  },

  APPEALS: {
    LIST: `${API_BASE_URL}/appeals`,
    GET:              (id: number) => `${API_BASE_URL}/appeals/${id}`,
    SEARCH:           `${API_BASE_URL}/appeals/search`,
    KPIS:             `${API_BASE_URL}/appeals/kpis`,
    BY_CASE:          (caseId: number) => `${API_BASE_URL}/appeals/by-case/${caseId}`,
    REVIEW:           (id: number) => `${API_BASE_URL}/appeals/${id}/review`,
    SCHEDULE_HEARING: (id: number) => `${API_BASE_URL}/appeals/${id}/schedule-hearing`,
    DECIDE:           (id: number) => `${API_BASE_URL}/appeals/${id}/decide`,
    CLOSE:            (id: number) => `${API_BASE_URL}/appeals/${id}/close`,
    MY_LIST:          `${API_BASE_URL}/my-portal/appeals`,
    MY_GET:           (id: number) => `${API_BASE_URL}/my-portal/appeals/${id}`,
    MY_FILE:          `${API_BASE_URL}/my-portal/appeals`,
    MY_WITHDRAW:      (id: number) => `${API_BASE_URL}/my-portal/appeals/${id}/withdraw`,
  },

  // Users
  USERS: {
    LIST: `${API_BASE_URL}/users`,
    CREATE: `${API_BASE_URL}/users`,
    GET: (id: number) => `${API_BASE_URL}/users/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/users/${id}`,
  },

  // Roles
  ROLES: {
    LIST: `${API_BASE_URL}/roles`,
    CREATE: `${API_BASE_URL}/roles`,
    GET: (id: number) => `${API_BASE_URL}/roles/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/roles/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/roles/${id}`,
  },

  // Reports
  REPORTS: {
    VAT_SUMMARY: `${API_BASE_URL}/reports/vat-summary`,
    PAYMENT_SUMMARY: `${API_BASE_URL}/reports/payment-summary`,
    TAXPAYER_STATS: `${API_BASE_URL}/reports/taxpayer-stats`,
    KPI_SUMMARY: `${API_BASE_URL}/reports/kpi-summary`,
    REVENUE_TREND: `${API_BASE_URL}/reports/revenue-trend`,
    ZONE_PERFORMANCE: `${API_BASE_URL}/reports/zone-performance`,
    COMPLIANCE_RATE: `${API_BASE_URL}/reports/compliance-rate`,
    VAT_COLLECTION: `${API_BASE_URL}/reports/vat-collection`,
    INCOME_TAX: `${API_BASE_URL}/reports/income-tax`,
    PENALTY_COLLECTION: `${API_BASE_URL}/reports/penalty-collection`,
    REFUND_STATUS: `${API_BASE_URL}/reports/refund-status`,
    AIT_DEDUCTION: `${API_BASE_URL}/reports/ait-deduction`, // ← ADD
    IMPORT_DUTY: `${API_BASE_URL}/reports/import-duty`, // ← ADD
    TAX_BREAKDOWN: `${API_BASE_URL}/reports/tax-breakdown`, // ← ADD
    EXPORT: `${API_BASE_URL}/reports/export`,
  },

  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    REGISTER: `${API_BASE_URL}/public/register`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
  },

  // TaxStructures
  TAX_STRUCTURES: {
    LIST: `${API_BASE_URL}/tax-structures`,
    CREATE: `${API_BASE_URL}/tax-structures`,
    UPDATE: (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    GET: (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    MASTER_DATA: `${API_BASE_URL}/tax-structures/master-data`,
    PREVIEW: (id: number) => `${API_BASE_URL}/tax-structures/${id}/preview`,
    PREVIEW_ADHOC: `${API_BASE_URL}/tax-structures/preview`,
    BY_SOURCE: (source: string) =>
      `${API_BASE_URL}/tax-structures?source=${source}`,
  },

  // TaxableProducts
  TAXABLE_PRODUCTS: {
    LIST: `${API_BASE_URL}/taxable-products`,
    CREATE: `${API_BASE_URL}/taxable-products`,
    UPDATE: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    GET: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    CATEGORIES: `${API_BASE_URL}/taxable-products/categories`,
    UNITS: `${API_BASE_URL}/taxable-products/units`,
  },

  // Refunds
  REFUNDS: {
    LIST: `${API_BASE_URL}/refunds`,
    MY: `${API_BASE_URL}/refunds/my`,
    CREATE: `${API_BASE_URL}/refunds`,
    GET: (id: number) => `${API_BASE_URL}/refunds/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/refunds/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/refunds/${id}`,
    SUBMIT: (id: number) => `${API_BASE_URL}/refunds/${id}/submit`,
    RESPOND: (id: number) => `${API_BASE_URL}/refunds/${id}/respond`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/refunds/${id}/status`,
    STATUS_HISTORY: (id: number) =>
      `${API_BASE_URL}/refunds/${id}/status-history`,
    VALIDATE_BANK: `${API_BASE_URL}/refunds/validate-bank`,
    CALCULATE: `${API_BASE_URL}/refunds/calculate`,
    QUEUE: {
      OFFICER: `${API_BASE_URL}/refunds/queue/officer`,
      SUPERVISOR: `${API_BASE_URL}/refunds/queue/supervisor`,
      FINANCE: `${API_BASE_URL}/refunds/queue/finance`,
    },
    SOURCES: {
      ITR: `${API_BASE_URL}/refunds/sources/itr`,
      AIT: `${API_BASE_URL}/refunds/sources/ait`,
      VAT: `${API_BASE_URL}/refunds/sources/vat`,
      PAYMENTS: `${API_BASE_URL}/refunds/sources/payments`,
    },
    DOCUMENTS: {
      LIST: (id: number) => `${API_BASE_URL}/refunds/${id}/documents`,
      UPLOAD: (id: number) => `${API_BASE_URL}/refunds/${id}/documents`,
      DELETE: (id: number, docId: number) =>
        `${API_BASE_URL}/refunds/${id}/documents/${docId}`,
      GET: (id: number, docId: number) =>
        `${API_BASE_URL}/refunds/${id}/documents/${docId}`,
    },
  },

  // MasterData
  MASTER_DATA: {
    DIVISIONS: `${API_BASE_URL}/master/divisions`,
    DISTRICTS: `${API_BASE_URL}/master/districts`,
    TAXPAYER_TYPES: `${API_BASE_URL}/master/taxpayer-types`,
    BUSINESS_TYPES: `${API_BASE_URL}/master/business-types`,
    BUSINESS_CATEGORIES: `${API_BASE_URL}/master/business-categories`,
    AIT_SOURCE_TYPES: `${API_BASE_URL}/master/ait/source-types`,
    AIT_STATUSES: `${API_BASE_URL}/master/ait/statuses`,
    IMPORT_PORTS: `${API_BASE_URL}/master/import-duty/ports`,
    IMPORT_COUNTRIES: `${API_BASE_URL}/master/import-duty/countries`,
    IMPORT_DUTY_STATUSES: `${API_BASE_URL}/master/import-duty/statuses`,

    TAX_ZONES: `${API_BASE_URL}/master/tax-zones`,
    DISTRICTS_BY_DIVISION: (divisionId: number) =>
      `${API_BASE_URL}/master/divisions/${divisionId}/districts`,
    TAX_ZONES_BY_DISTRICT: (districtId: number) =>
      `${API_BASE_URL}/master/districts/${districtId}/tax-zones`,
    TAX_CIRCLES_BY_ZONE: (zoneId: number) =>
      `${API_BASE_URL}/master/tax-zones/${zoneId}/tax-circles`,
  },
};
