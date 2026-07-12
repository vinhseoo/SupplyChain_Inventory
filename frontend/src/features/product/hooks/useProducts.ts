import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, type ProductTableParams } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { uomService } from '@/services/uomService';
import type { ProductRequest, CategoryRequest, UnitOfMeasureRequest, TableParams } from '@/types';
import { message } from 'antd';

// ===== Product Hooks =====

export const useProducts = (params?: ProductTableParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await productService.getAll(params);
      return res.data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Thêm sản phẩm thành công');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequest }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Cập nhật sản phẩm thành công');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Xóa sản phẩm thành công');
    },
  });
};

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.importExcel,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (res.data.totalFailed > 0) {
        message.warning(`Nhập Excel hoàn tất. Thành công: ${res.data.totalSuccess}, Thất bại: ${res.data.totalFailed}`);
      } else {
        message.success(`Nhập Excel thành công ${res.data.totalSuccess} sản phẩm.`);
      }
    },
  });
};

// ===== Category Hooks =====

export const useCategories = (search?: string) => {
  return useQuery({
    queryKey: ['categories', search],
    queryFn: async () => {
      const res = await categoryService.getAll(search);
      return res.data || [];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Thêm danh mục thành công');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) => categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Cập nhật danh mục thành công');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Xóa danh mục thành công');
    },
  });
};

// ===== UOM Hooks =====

export const useUoms = (params?: TableParams) => {
  return useQuery({
    queryKey: ['uoms', params],
    queryFn: async () => {
      const res = await uomService.getAll(params);
      return res.data;
    },
  });
};

export const useCreateUom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uomService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
      message.success('Thêm đơn vị tính thành công');
    },
  });
};

export const useUpdateUom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UnitOfMeasureRequest }) => uomService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
      message.success('Cập nhật đơn vị tính thành công');
    },
  });
};

export const useDeleteUom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uomService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] });
      message.success('Xóa đơn vị tính thành công');
    },
  });
};
