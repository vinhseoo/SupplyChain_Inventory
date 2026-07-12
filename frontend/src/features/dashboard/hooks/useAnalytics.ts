import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const useKpis = () => {
  return useQuery({
    queryKey: ['analytics', 'kpis'],
    queryFn: () => analyticsService.getKpis().then(res => res.data),
    refetchInterval: 60000, // refresh every minute
  });
};

export const useAbcClassification = () => {
  return useQuery({
    queryKey: ['analytics', 'abc'],
    queryFn: () => analyticsService.getAbcClassification().then(res => res.data),
  });
};

export const useSlowMovingInventory = (minDaysInactive?: number) => {
  return useQuery({
    queryKey: ['analytics', 'slow-moving', minDaysInactive],
    queryFn: () => analyticsService.getSlowMovingInventory(minDaysInactive).then(res => res.data),
  });
};

export const useStockDepletionForecast = (maxDaysToOut?: number) => {
  return useQuery({
    queryKey: ['analytics', 'forecast', maxDaysToOut],
    queryFn: () => analyticsService.getStockDepletionForecast(maxDaysToOut).then(res => res.data),
  });
};

export const useMovementTrend = (lastDays?: number) => {
  return useQuery({
    queryKey: ['analytics', 'trend', lastDays],
    queryFn: () => analyticsService.getMovementTrend(lastDays).then(res => res.data),
  });
};

export interface StockChangeMessage {
  productId: number;
  sku: string;
  name: string;
  quantity: number;
  timestamp: string;
}

export const useRealTimeStock = (onStockChange: (data: StockChangeMessage) => void) => {
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/analytics/stock-realtime`);

    const handleStockChange = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as StockChangeMessage;
        onStockChange(data);
      } catch (err) {
        console.error('Failed to parse SSE stock change data:', err);
      }
    };

    eventSource.addEventListener('STOCK_CHANGE', handleStockChange);

    eventSource.addEventListener('INIT', (event: any) => {
      console.log('SSE connection initialized:', event.data);
    });

    eventSource.onerror = () => {
      // Suppress error logs to keep console clean, browser automatically reconnects SSE
    };

    return () => {
      eventSource.removeEventListener('STOCK_CHANGE', handleStockChange);
      eventSource.close();
    };
  }, [onStockChange]);
};
