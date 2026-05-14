import { AitSourceType } from "src/app/models/ait.model";

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
    UPLOAD_PHOTO: (id: number) => `${API_BASE_URL}/taxpayers/${id}/photo`,
    GET_PHOTO:    (id: number) => `${API_BASE_URL}/taxpayers/${id}/photo`,
    PENDING: `${API_BASE_URL}/taxpayers/pending`,
    APPROVE: (id: number) => `${API_BASE_URL}/taxpayers/${id}/approve`,
    REJECT:  (id: number) => `${API_BASE_URL}/taxpayers/${id}/reject`,
    MY_APPLICATION: (id: number) => `${API_BASE_URL}/taxpayers/${id}`,
    EXPORT: `${API_BASE_URL}/taxpayers/export`,
  },

  // Business
  BUSINESSES: {
    LIST:   `${API_BASE_URL}/businesses`,
    CREATE: `${API_BASE_URL}/businesses`,
    UPDATE: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/businesses/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/businesses/${id}`,
    BY_TAXPAYER_VAT_STATUS: (taxpayerId: number) =>
    `${API_BASE_URL}/businesses/by-taxpayer/${taxpayerId}/vat-status`,
  },


  // TIN Management
  TINS: {
    LIST:   `${API_BASE_URL}/tins`,
    CREATE: `${API_BASE_URL}/tins`,
    UPDATE: (id: number) => `${API_BASE_URL}/tins/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/tins/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/tins/${id}`,
    BY_TAXPAYER: (taxpayerId: number) => `${API_BASE_URL}/tins/my-tin/${taxpayerId}`,
    EXPORT: `${API_BASE_URL}/tins/export`,
    BASE:   `${API_BASE_URL}/tins`,
    DOWNLOAD_CERT: (id: number) => `${API_BASE_URL}/tins/${id}/certificate`
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
    DELETE: (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/vat-returns/${id}`,
  },

  // Income Tax Returns
  INCOME_TAX_RETURNS: {
    LIST:    `${API_BASE_URL}/income-tax-returns`,
    CREATE:  `${API_BASE_URL}/income-tax-returns`,
    PREVIEW: `${API_BASE_URL}/income-tax-returns/preview`,
    UPDATE:  (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    DELETE:  (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    GET:     (id: number) => `${API_BASE_URL}/income-tax-returns/${id}`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/income-tax-returns/${id}/status`,
    EXPORT:  `${API_BASE_URL}/income-tax-returns/export`,
  },

  IT10B: {
    CREATE:    `${API_BASE_URL}/it10b`,
    BY_RETURN: (returnId: number) => `${API_BASE_URL}/it10b/by-return/${returnId}`,
    GET:       (id: number)       => `${API_BASE_URL}/it10b/${id}`,
    UPDATE:    (id: number)       => `${API_BASE_URL}/it10b/${id}`,
    DELETE:    (id: number)       => `${API_BASE_URL}/it10b/${id}`,
  },

  // AIT (Advance Income Tax)
  AITS: {
    LIST:   `${API_BASE_URL}/aits`,
    CREATE: `${API_BASE_URL}/aits`,
    UPDATE: (id: number) => `${API_BASE_URL}/aits/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/aits/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/aits/${id}`,
  },

  // Fiscal Years
  FISCAL_YEARS: {
    LIST:   `${API_BASE_URL}/fiscal-years`,
    ACTIVE: `${API_BASE_URL}/fiscal-years/active`,
    CREATE: `${API_BASE_URL}/fiscal-years`,
    UPDATE: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/fiscal-years/${id}`,
  },

  // Import Duty
  IMPORT_DUTIES: {
    LIST:    `${API_BASE_URL}/import-duty`,
    CREATE:  `${API_BASE_URL}/import-duty`,
    GET:     (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    UPDATE:  (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    DELETE:  (id: number) => `${API_BASE_URL}/import-duty/${id}`,
    PREVIEW: `${API_BASE_URL}/import-duty/preview-tax`,
  },



  // Payments
    PAYMENTS: {
    LIST:          `${API_BASE_URL}/payments`,
    CREATE:        `${API_BASE_URL}/payments`,
    GET:           (id: number) => `${API_BASE_URL}/payments/${id}`,
    DELETE:        (id: number) => `${API_BASE_URL}/payments/${id}`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/payments/${id}/status`,
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
    UPDATE: (id: number) => `${API_BASE_URL}/audits/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/audits/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/audits/${id}`,
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
    LOGIN:           `${API_BASE_URL}/auth/login`,
    LOGOUT:          `${API_BASE_URL}/auth/logout`,
    PROFILE:         `${API_BASE_URL}/auth/profile`,
    REGISTER:        `${API_BASE_URL}/public/register`,
    VERIFY_EMAIL:    `${API_BASE_URL}/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD:  `${API_BASE_URL}/auth/reset-password`,
  },

  // TaxStructures
  TAX_STRUCTURES: {
    LIST:          `${API_BASE_URL}/tax-structures`,
    CREATE:        `${API_BASE_URL}/tax-structures`,
    UPDATE:        (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    DELETE:        (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
    GET:           (id: number) => `${API_BASE_URL}/tax-structures/${id}`,
 
    /** GET  /api/tax-structures/master-data — taxTypes, applicables, statuses, rateTypes */
    MASTER_DATA:   `${API_BASE_URL}/tax-structures/master-data`,
 
    /** POST /api/tax-structures/{id}/preview  body: { amount } */
    PREVIEW:       (id: number) => `${API_BASE_URL}/tax-structures/${id}/preview`,
 
    /** POST /api/tax-structures/preview  body: { amount, rateType, rate, slabs } */
    PREVIEW_ADHOC: `${API_BASE_URL}/tax-structures/preview`,
 
    BY_SOURCE:     (source: string) => `${API_BASE_URL}/tax-structures?source=${source}`,
  },

  // TaxableProducts
  TAXABLE_PRODUCTS: {
    LIST:   `${API_BASE_URL}/taxable-products`,
    CREATE: `${API_BASE_URL}/taxable-products`,
    UPDATE: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    GET:    (id: number) => `${API_BASE_URL}/taxable-products/${id}`,
    CATEGORIES: `${API_BASE_URL}/taxable-products/categories`,
    UNITS:      `${API_BASE_URL}/taxable-products/units`,
  },

  // Refunds
  REFUNDS: {
    LIST:   `${API_BASE_URL}/refunds`,
    CREATE: `${API_BASE_URL}/refunds`,
    GET:    (id: number) => `${API_BASE_URL}/refunds/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/refunds/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/refunds/${id}`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/refunds/${id}/status`,
  },

  // Get MaterData
  MASTER_DATA: {
  DIVISIONS: `${API_BASE_URL}/master/divisions`,
  DISTRICTS: `${API_BASE_URL}/master/districts`,
  TAXPAYER_TYPES: `${API_BASE_URL}/master/taxpayer-types`,
  BUSINESS_TYPES:      `${API_BASE_URL}/master/business-types`,
  BUSINESS_CATEGORIES: `${API_BASE_URL}/master/business-categories`,
  AIT_SOURCE_TYPES: `${API_BASE_URL}/master/ait/source-types`,
  AIT_STATUSES: `${API_BASE_URL}/master/ait/statuses`,
  IMPORT_PORTS: `${API_BASE_URL}/master/import-duty/ports`,
  IMPORT_COUNTRIES: `${API_BASE_URL}/master/import-duty/countries`,
  IMPORT_DUTY_STATUSES: `${API_BASE_URL}/master/import-duty/statuses`,
  DISTRICTS_BY_DIVISION: (divisionId: number) =>
    `${API_BASE_URL}/master/divisions/${divisionId}/districts`,
  TAX_ZONES_BY_DISTRICT: (districtId: number) =>
    `${API_BASE_URL}/master/districts/${districtId}/tax-zones`,
  TAX_CIRCLES_BY_ZONE: (zoneId: number) =>
    `${API_BASE_URL}/master/tax-zones/${zoneId}/tax-circles`,
  }
};
