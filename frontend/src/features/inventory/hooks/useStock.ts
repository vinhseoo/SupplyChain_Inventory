import { useQuery } from '@tanstack/react-query';
import { stockService } from '@/services/stockService';
import type { StockLevelParams, StockCardParams } from '@/services/stockService';

export const useStockLevels = (params?: StockLevelParams) => {
  return useQuery({
    queryKey: ['stock-levels', params],
    queryFn: async () => {
      const res = await stockService.getStockLevels(params);
      return res.data;
    },
  });
};

export const useStockCard = (params?: StockCardParams) => {
  return useQuery({
    queryKey: ['stock-card', params],
    queryFn: async () => {
      const res = await stockService.getStockCard(params);
      return res.data;
    },
  });
};
