import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '@/services/warehouseService';
import { locationService } from '@/services/locationService';
import type { WarehouseRequest, LocationRequest, TableParams } from '@/types';
import { message } from 'antd';

export const useWarehouses = (params?: TableParams) => {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: async () => {
      const res = await warehouseService.getAll(params);
      return res.data;
    },
  });
};

export const useWarehouseTree = (warehouseId: number | null) => {
  return useQuery({
    queryKey: ['warehouseTree', warehouseId],
    queryFn: async () => {
      if (warehouseId === null) return [];
      const res = await warehouseService.getLocationTree(warehouseId);
      return res.data;
    },
    enabled: warehouseId !== null,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: warehouseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      message.success('Thêm kho hàng thành công');
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WarehouseRequest }) => warehouseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      message.success('Cập nhật kho hàng thành công');
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: warehouseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      message.success('Xóa kho hàng thành công');
    },
  });
};

export const useCreateLocation = (warehouseId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: locationService.create,
    onSuccess: () => {
      if (warehouseId) {
        queryClient.invalidateQueries({ queryKey: ['warehouseTree', warehouseId] });
      }
      message.success('Thêm vị trí thành công');
    },
  });
};

export const useUpdateLocation = (warehouseId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LocationRequest }) => locationService.update(id, data),
    onSuccess: () => {
      if (warehouseId) {
        queryClient.invalidateQueries({ queryKey: ['warehouseTree', warehouseId] });
      }
      message.success('Cập nhật vị trí thành công');
    },
  });
};

export const useDeleteLocation = (warehouseId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: locationService.delete,
    onSuccess: () => {
      if (warehouseId) {
        queryClient.invalidateQueries({ queryKey: ['warehouseTree', warehouseId] });
      }
      message.success('Xóa vị trí thành công');
    },
  });
};
