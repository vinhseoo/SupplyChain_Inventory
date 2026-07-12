import { useQuery } from '@tanstack/react-query';
import { stocktakeService } from '@/services/stocktakeService';
import type { StockAdjustmentFilterParams } from '@/services/stocktakeService';

export const useStockAdjustments = (params?: StockAdjustmentFilterParams) => {
  return useQuery({
    queryKey: ['stock-adjustments', params],
    queryFn: async () => {
      const res = await stocktakeService.getAllAdjustments(params);
      return res.data;
    },
  });
};

export const useStockAdjustment = (id?: number) => {
  return useQuery({
    queryKey: ['stock-adjustment', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await stocktakeService.getAdjustmentById(id);
      return res.data;
    },
    enabled: !!id,
  });
};
