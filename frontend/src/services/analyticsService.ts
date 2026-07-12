import { apiClient } from '@/config/apiClient';
import type { ApiResponse } from '@/types';

export interface KpiSummaryResponse {
  totalInventoryValue: number;
  totalSkus: number;
  totalInboundTransactions: number;
  totalOutboundTransactions: number;
  activeAlertsCount: number;
}

export interface AbcClassificationResponse {
  productId: number;
  name: string;
  sku: string;
  totalValue: number;
  cumulativePercentage: number;
  abcClass: 'A' | 'B' | 'C';
}

export interface SlowMovingItemResponse {
  productId: number;
  name: string;
  sku: string;
  price: number;
  currentStock: number;
  lastMovementDate: string;
  daysInactive: number;
}

export interface StockDepletionForecastResponse {
  productId: number;
  name: string;
  sku: string;
  currentStock: number;
  avgDailyConsumption: number;
  daysToOut: number;
}

export interface MovementTrendResponse {
  date: string;
  inboundQty: number;
  outboundQty: number;
}

export const analyticsService = {
  getKpis: (): Promise<ApiResponse<KpiSummaryResponse>> => {
    return apiClient.get('/analytics/kpis');
  },

  getAbcClassification: (): Promise<ApiResponse<AbcClassificationResponse[]>> => {
    return apiClient.get('/analytics/abc');
  },

  getSlowMovingInventory: (minDaysInactive?: number): Promise<ApiResponse<SlowMovingItemResponse[]>> => {
    return apiClient.get('/analytics/slow-moving', { params: { minDaysInactive } });
  },

  getStockDepletionForecast: (maxDaysToOut?: number): Promise<ApiResponse<StockDepletionForecastResponse[]>> => {
    return apiClient.get('/analytics/forecast', { params: { maxDaysToOut } });
  },

  getMovementTrend: (lastDays?: number): Promise<ApiResponse<MovementTrendResponse[]>> => {
    return apiClient.get('/analytics/trend', { params: { lastDays } });
  },
};
