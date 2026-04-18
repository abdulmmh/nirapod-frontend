// ── Read (from backend response) ─────────────────────────────────────────────
export interface IT10B {
  id:                       number;
  returnId:                 number;   
  nonAgriculturalProperty:  number;
  agriculturalProperty:     number;
  investments:              number;
  motorVehicles:            number;
  bankBalances:             number;
  personalLiabilities:      number;
  netWealth:                number;   
  deleted:                  boolean;
}

// ── Create / Update (sent to backend) ────────────────────────────────────────
export interface IT10BRequest {
  returnId:                 number;  
  nonAgriculturalProperty:  number;
  agriculturalProperty:     number;
  investments:              number;
  motorVehicles:            number;
  bankBalances:             number;
  personalLiabilities:      number;
}
