export interface Division {
  id: number;
  name: string;
}
export interface District {
  id: number;
  name: string;
  divisionId: number;
}

export interface TaxZone {
  id: number;
  name: string; // backend er sathe nam miliye nen
}

export interface TaxCircle {
  id: number;
  name: string; // backend er sathe nam miliye nen
  taxZoneId?: number; // Jodi relation thake
}

//------------ Taxpayer related -------

export interface TaxpayerType {
  id: number;
  typeName: string;
  category: string
}


//------------- Business related ----------
export interface BusinessType {
  id: number;
  typeName: string;
}

export interface BusinessCategory {
  id: number;
  categoryName: string;
}