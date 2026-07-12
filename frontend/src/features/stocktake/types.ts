export type StocktakeStatus = 'DRAFT' | 'COMPLETED' | 'ADJUSTED' | 'CANCELLED';
export type StockAdjustmentStatus = 'DRAFT' | 'APPROVED' | 'CANCELLED';

export interface StocktakeSessionRequest {
  warehouseId: number;
  note?: string;
}

export interface StocktakeItemRequest {
  actualQuantity: number;
  note?: string;
}

export interface BarcodeScanRequest {
  code: string;
  locationId: number;
}

export interface StocktakeItemResponse {
  id: number;
  sessionId: number;
  productId: number;
  productName: string;
  productCode: string;
  productSku: string;
  uomName: string;
  locationId: number;
  locationName: string;
  locationCode: string;
  batchId?: number;
  batchNumber?: string;
  systemQuantity: number;
  actualQuantity: number;
  variance: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StocktakeSessionResponse {
  id: number;
  code: string;
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  status: StocktakeStatus;
  note?: string;
  items: StocktakeItemResponse[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

export interface StockAdjustmentItemResponse {
  id: number;
  adjustmentId: number;
  productId: number;
  productName: string;
  productCode: string;
  productSku: string;
  uomName: string;
  locationId: number;
  locationName: string;
  locationCode: string;
  batchId?: number;
  batchNumber?: string;
  systemQuantity: number;
  actualQuantity: number;
  adjustedQuantity: number;
  reason?: string;
  createdAt: string;
}

export interface StockAdjustmentResponse {
  id: number;
  code: string;
  sessionId?: number;
  sessionCode?: string;
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  status: StockAdjustmentStatus;
  reason?: string;
  items: StockAdjustmentItemResponse[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
