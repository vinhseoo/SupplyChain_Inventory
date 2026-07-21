import { apiClient } from '@/config/apiClient';
import type { ApiResponse, PageResponse, TableParams } from '@/types';
import type {
  StocktakeSessionRequest,
  StocktakeSessionResponse,
  StocktakeItemRequest,
  BarcodeScanRequest,
  StockAdjustmentResponse,
  StocktakeStatus,
  StockAdjustmentStatus
} from '../features/stocktake/types';

export interface StocktakeFilterParams extends TableParams {
  search?: string;
  warehouseId?: number;
  status?: StocktakeStatus;
}

export interface StockAdjustmentFilterParams extends TableParams {
  search?: string;
  warehouseId?: number;
  status?: StockAdjustmentStatus;
}

export const stocktakeService = {
  // Session APIs
  getAllSessions: (params?: StocktakeFilterParams): Promise<ApiResponse<PageResponse<StocktakeSessionResponse>>> => {
    return apiClient.get('/stocktake/sessions', { params });
  },

  getSessionById: (id: number): Promise<ApiResponse<StocktakeSessionResponse>> => {
    return apiClient.get(`/stocktake/sessions/${id}`);
  },

  createSession: (data: StocktakeSessionRequest): Promise<ApiResponse<StocktakeSessionResponse>> => {
    return apiClient.post('/stocktake/sessions', data);
  },

  updateItemQty: (id: number, itemId: number, data: StocktakeItemRequest): Promise<ApiResponse<StocktakeSessionResponse>> => {
    return apiClient.put(`/stocktake/sessions/${id}/items/${itemId}`, data);
  },

  deleteItem: (id: number, itemId: number): Promise<ApiResponse<StocktakeSessionResponse>> => {
    return apiClient.delete(`/stocktake/sessions/${id}/items/${itemId}`);
  },

  scanBarcode: (id: number, data: BarcodeScanRequest): Promise<ApiResponse<StocktakeSessionResponse>> => {
    return apiClient.post(`/stocktake/sessions/${id}/scan`, data);
  },

  completeSession: (id: number): Promise<ApiResponse<StocktakeSessionResponse>> => {
    return apiClient.post(`/stocktake/sessions/${id}/complete`);
  },

  cancelSession: (id: number): Promise<ApiResponse<StocktakeSessionResponse>> => {
    return apiClient.post(`/stocktake/sessions/${id}/cancel`);
  },

  createAdjustment: (id: number): Promise<ApiResponse<StockAdjustmentResponse>> => {
    return apiClient.post(`/stocktake/sessions/${id}/adjust`);
  },

  // Adjustment view APIs
  getAllAdjustments: (params?: StockAdjustmentFilterParams): Promise<ApiResponse<PageResponse<StockAdjustmentResponse>>> => {
    return apiClient.get('/stock-adjustments', { params });
  },

  getAdjustmentById: (id: number): Promise<ApiResponse<StockAdjustmentResponse>> => {
    return apiClient.get(`/stock-adjustments/${id}`);
  },
};
