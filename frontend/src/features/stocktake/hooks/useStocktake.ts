import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stocktakeService } from '@/services/stocktakeService';
import type { StocktakeFilterParams } from '@/services/stocktakeService';
import type { StocktakeSessionRequest, StocktakeItemRequest, BarcodeScanRequest } from '../types';
import { message } from 'antd';

export const useStocktakeSessions = (params?: StocktakeFilterParams) => {
  return useQuery({
    queryKey: ['stocktake-sessions', params],
    queryFn: async () => {
      const res = await stocktakeService.getAllSessions(params);
      return res.data;
    },
  });
};

export const useStocktakeSession = (id?: number) => {
  return useQuery({
    queryKey: ['stocktake-session', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await stocktakeService.getSessionById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateStocktakeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StocktakeSessionRequest) => stocktakeService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocktake-sessions'] });
      message.success('Khởi tạo phiên kiểm kê thành công');
    },
  });
};

export const useUpdateStocktakeItemQty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId, data }: { id: number; itemId: number; data: StocktakeItemRequest }) =>
      stocktakeService.updateItemQty(id, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stocktake-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stocktake-session', variables.id] });
      message.success('Cập nhật số lượng thực tế thành công');
    },
  });
};

export const useScanBarcode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BarcodeScanRequest }) =>
      stocktakeService.scanBarcode(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stocktake-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stocktake-session', variables.id] });
      message.success('Quét mã thành công');
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Quét mã thất bại');
    }
  });
};

export const useCompleteStocktakeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => stocktakeService.completeSession(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['stocktake-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stocktake-session', id] });
      message.success('Hoàn thành kiểm kê thành công');
    },
  });
};

export const useCancelStocktakeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => stocktakeService.cancelSession(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['stocktake-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stocktake-session', id] });
      message.success('Hủy phiên kiểm kê thành công');
    },
  });
};

export const useCreateAdjustmentFromStocktake = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => stocktakeService.createAdjustment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['stocktake-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stocktake-session', id] });
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      message.success('Tạo phiếu điều chỉnh tồn kho thành công');
    },
  });
};
