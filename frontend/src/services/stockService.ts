import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  StockLevelResponse, 
  StockMovementResponse, 
  TableParams 
} from '@/types';

export interface StockLevelParams extends TableParams {
  warehouseId?: number;
  productId?: number;
  locationId?: number;
}

export interface StockCardParams extends TableParams {
  productId?: number;
  warehouseId?: number;
  locationId?: number;
  startDate?: string;
  endDate?: string;
}

export const stockService = {
  getStockLevels: (params?: StockLevelParams): Promise<ApiResponse<PageResponse<StockLevelResponse>>> => {
    return apiClient.get('/inventory/stock-levels', { params });
  },

  getStockCard: (params?: StockCardParams): Promise<ApiResponse<PageResponse<StockMovementResponse>>> => {
    return apiClient.get('/inventory/stock-levels/history', { params });
  }
};
