export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {

  // Dashboard
  DASHBOARD: {
    STATS:           `${API_BASE_URL}/dashboard/stats`,
    RECENT_TAXPAYERS:`${API_BASE_URL}/dashboard/recent-taxpayers`,
    RECENT_PAYMENTS: `${API_BASE_URL}/dashboard/recent-payments`,
    VAT_CHART:       `${API_BASE_URL}/dashboard/vat-chart`,
    PAYMENT_CHART:   `${API_BASE_URL}/dashboard/payment-chart`,
  },

  // Taxpayer
  TAXPAYERS: {
    LIST:   `${API_BASE_URL}/taxpayers`,
    CREATE: `${API_BASE_URL}/taxpayers`,
    UPDATE: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
  },

  // Business
  BUSINESSES: {
    LIST:   `${API_BASE_URL}/businesses`,
    CREATE: `${API_BASE_URL}/businesses`,
    UPDATE: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/businesses/${id}`,
  },
  // TIN Management
  TIN: {
    LIST:   `${API_BASE_URL}/tin`,
    CREATE: `${API_BASE_URL}/tin`,
    UPDATE: (id: number) => `${API_BASE_URL}/tin/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/tin/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/tin/${id}`,
  },

  // VAT Registration
  VAT_REGISTRATIONS: {
    LIST:   `${API_BASE_URL}/vat-registrations`,
    CREATE: `${API_BASE_URL}/vat-registrations`,
    UPDATE: (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/vat-registrations/${id}`,
  },

  // VAT Returns
  VAT_RETURNS: {
    LIST:   `${API_BASE_URL}/vat-returns`,
    CREATE: `${API_BASE_URL}/vat-returns`,
    UPDATE: (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
  },

  // AIT (Annual Income Tax)
  AIT: {
    LIST:   `${API_BASE_URL}/ait`,
    CREATE: `${API_BASE_URL}/ait`,
    UPDATE: (id: number) => `${API_BASE_URL}/ait/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/ait/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/ait/${id}`,
  },

  // Fiscal Years
  FISCAL_YEARS: {
    LIST:   `${API_BASE_URL}/fiscal-years`,
    CREATE: `${API_BASE_URL}/fiscal-years`,
    UPDATE: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
  },


  // Payments
  PAYMENTS: {
    LIST:   `${API_BASE_URL}/payments`,
    CREATE: `${API_BASE_URL}/payments`,
    GET:    (id: number) => `${API_BASE_URL}/payments/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/payments/${id}`,
  },

  // Notices & Notifications
  NOTICES: {
    LIST:   `${API_BASE_URL}/notices`,
    CREATE: `${API_BASE_URL}/notices`,
    GET:    (id: number) => `${API_BASE_URL}/notices/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/notices/${id}`,
  },

  // Penalties & Fines
  PENALTIES: {
    LIST:   `${API_BASE_URL}/penalties`,
    CREATE: `${API_BASE_URL}/penalties`,
    GET:    (id: number) => `${API_BASE_URL}/penalties/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/penalties/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/penalties/${id}`,
  },

  // Documents
  DOCUMENTS: {
    LIST:   `${API_BASE_URL}/documents`,
    CREATE: `${API_BASE_URL}/documents`,
    GET:    (id: number) => `${API_BASE_URL}/documents/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/documents/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/documents/${id}`,
  },

  // Audits
  AUDITS: {
    LIST:   `${API_BASE_URL}/audits`,
    CREATE: `${API_BASE_URL}/audits`,
    GET:    (id: number) => `${API_BASE_URL}/audits/${id}`,
  },

  // Users
  USERS: {
    LIST:   `${API_BASE_URL}/users`,
    CREATE: `${API_BASE_URL}/users`,
    UPDATE: (id: number) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/users/${id}`,
  },

  // Reports
  REPORTS: {
    VAT_SUMMARY:     `${API_BASE_URL}/reports/vat-summary`,
    PAYMENT_SUMMARY: `${API_BASE_URL}/reports/payment-summary`,
    TAXPAYER_STATS:  `${API_BASE_URL}/reports/taxpayer-stats`,
  },

  // Auth
  AUTH: {
    LOGIN:   `${API_BASE_URL}/auth/login`,
    LOGOUT:  `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
  },

  // TaxStructures
  TAX_STRUCTURES: {
    LIST:   `${API_BASE_URL}/tax-structures`,
    CREATE: `${API_BASE_URL}/tax-structures`,
    UPDATE: (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
  },

  // TaxableProducts
  TAXABLE_PRODUCTS: {
    LIST:   `${API_BASE_URL}/taxable-products`,
    CREATE: `${API_BASE_URL}/taxable-products`,
    UPDATE: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
  }

};