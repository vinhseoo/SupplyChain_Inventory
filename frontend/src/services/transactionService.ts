import { apiClient } from '@/config/apiClient';
import type { 
  ApiResponse, 
  PageResponse, 
  InventoryTransactionResponse, 
  InventoryTransactionRequest,
  StockLevelResponse, 
  TableParams 
} from '@/types';

export interface TransactionParams extends TableParams {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const transactionService = {
  getAll: (params?: TransactionParams): Promise<ApiResponse<PageResponse<InventoryTransactionResponse>>> => {
    return apiClient.get('/inventory/transactions', { params });
  },

  getById: (id: number): Promise<ApiResponse<InventoryTransactionResponse>> => {
    return apiClient.get(`/inventory/transactions/${id}`);
  },

  create: (data: InventoryTransactionRequest): Promise<ApiResponse<InventoryTransactionResponse>> => {
    return apiClient.post('/inventory/transactions', data);
  },

  update: (id: number, data: InventoryTransactionRequest): Promise<ApiResponse<InventoryTransactionResponse>> => {
    return apiClient.put(`/inventory/transactions/${id}`, data);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/inventory/transactions/${id}`);
  },

  submit: (id: number): Promise<ApiResponse<InventoryTransactionResponse>> => {
    return apiClient.post(`/inventory/transactions/${id}/submit`);
  },

  approve: (id: number): Promise<ApiResponse<InventoryTransactionResponse>> => {
    return apiClient.post(`/inventory/transactions/${id}/approve`);
  },

  reject: (id: number, reason?: string): Promise<ApiResponse<InventoryTransactionResponse>> => {
    return apiClient.post(`/inventory/transactions/${id}/reject`, null, {
      params: { reason }
    });
  },

  complete: (id: number): Promise<ApiResponse<InventoryTransactionResponse>> => {
    return apiClient.post(`/inventory/transactions/${id}/complete`);
  },

  suggestOutbound: (productId: number, warehouseId: number, quantity: number, strategy: string = 'FEFO'): Promise<ApiResponse<StockLevelResponse[]>> => {
    return apiClient.get('/inventory/transactions/suggest-outbound', {
      params: { productId, warehouseId, quantity, strategy }
    });
  },

  downloadPdf: (id: number): Promise<Blob> => {
    return apiClient.get(`/inventory/transactions/${id}/pdf`, {
      responseType: 'blob'
    });
  }
};
