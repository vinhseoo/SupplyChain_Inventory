import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/supplierService';
import type { SupplierRequest, TableParams } from '@/types';
import { message } from 'antd';

export const useSuppliers = (params?: TableParams) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const res = await supplierService.getAll(params);
      return res.data;
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      message.success('Thêm nhà cung cấp thành công');
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SupplierRequest }) => supplierService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      message.success('Cập nhật nhà cung cấp thành công');
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      message.success('Xóa nhà cung cấp thành công');
    },
  });
};
