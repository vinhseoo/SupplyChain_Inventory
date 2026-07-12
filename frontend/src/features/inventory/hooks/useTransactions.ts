import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import type { TransactionParams } from '@/services/transactionService';
import type { InventoryTransactionRequest } from '@/types';
import { message } from 'antd';

export const useTransactions = (params?: TransactionParams) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const res = await transactionService.getAll(params);
      return res.data;
    },
  });
};

export const useTransaction = (id?: number) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await transactionService.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      message.success('Tạo phiếu kho thành công');
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryTransactionRequest }) => transactionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
      message.success('Cập nhật phiếu kho thành công');
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      message.success('Xóa phiếu kho thành công');
    },
  });
};

export const useSubmitTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
      message.success('Gửi duyệt phiếu kho thành công');
    },
  });
};

export const useApproveTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
      message.success('Duyệt phiếu kho thành công');
    },
  });
};

export const useRejectTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => transactionService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
      message.success('Từ chối duyệt phiếu kho thành công');
    },
  });
};

export const useCompleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] });
      queryClient.invalidateQueries({ queryKey: ['stock-card'] });
      message.success('Hoàn thành giao dịch và cập nhật kho thành công');
    },
  });
};
