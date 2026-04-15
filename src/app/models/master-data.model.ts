export interface Division {
  id: number;
  name: string;
}
export interface District {
  id: number;
  name: string;
  divisionId: number;
}

//------------ Taxpayer related -------

export interface TaxpayerType {
  id: number;
  typeName: string;
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