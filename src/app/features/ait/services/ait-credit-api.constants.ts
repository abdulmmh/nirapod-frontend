// Add this block to your existing api.constants.ts
// under AIT_CREDIT key

const AIT_CREDIT_BASE = '/api/ait-credit-ledger';

export const AIT_CREDIT_ENDPOINTS = {
  MY:                AIT_CREDIT_BASE + '/my',
  MY_AVAILABLE:      AIT_CREDIT_BASE + '/my/available',
  MY_TOTAL:          AIT_CREDIT_BASE + '/my/total',
  BY_ID:             (id: number)          => `${AIT_CREDIT_BASE}/${id}`,
  BY_TAXPAYER:       (taxpayerId: number)  => `${AIT_CREDIT_BASE}/taxpayer/${taxpayerId}`,
  APPLY:             AIT_CREDIT_BASE + '/apply',
  ITR_APPLICATIONS:  (itrId: number)       => `${AIT_CREDIT_BASE}/itr/${itrId}/applications`,
  ITR_TOTAL:         (itrId: number)       => `${AIT_CREDIT_BASE}/itr/${itrId}/total`,
};

// In api.constants.ts, add:
// AIT_CREDIT: AIT_CREDIT_ENDPOINTS,
