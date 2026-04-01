export type ProductStatus   = 'Active' | 'Inactive' | 'Restricted';
export type ProductCategory = 'Electronics' | 'Textile' | 'Food & Beverage' | 'Pharmaceutical' | 'Machinery' | 'Chemicals' | 'Vehicles' | 'Agriculture' | 'Luxury' | 'Other';

export interface TaxableProduct {
  id: number;
  productCode: string;
  productName: string;
  hsCode: string;
  category: ProductCategory;
  taxType: string;
  taxStructureId: number;
  taxRate: number;
  unit: string;
  description: string;
  status: ProductStatus;
  createdAt: string;
}

export interface TaxableProductCreateRequest {
  productName: string;
  hsCode: string;
  category: string;
  taxType: string;
  taxStructureId: number;
  taxRate: number;
  unit: string;
  description: string;
  status: string;
}