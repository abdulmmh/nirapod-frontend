export type ProductStatus   = 'Active' | 'Inactive' | 'Restricted';
export type ProductCategory = string;

export interface TaxableProduct {
  id: number;
  productCode: string;
  productName: string;
  hsCode: string;
  category: ProductCategory;
  taxStructureId: number;
  taxType?: string;
  taxRate?: number;
  unit: string;
  description: string;
  status: ProductStatus;
  createdAt: string;
}

export interface TaxableProductCreateRequest {
  productName: string;
  hsCode: string;
  category: ProductCategory;
  taxStructureId: number;
  unit: string;
  description: string;
  status: ProductStatus;
}

export interface TaxableProductViewModel extends TaxableProduct {
  taxType: string;
  taxRate: number;
}