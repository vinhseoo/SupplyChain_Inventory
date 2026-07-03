---
name: frontend-form
description: Skill để xây dựng form với Ant Design Form, validation, và submit pattern trong SCIM.
---

# Frontend Form — Ant Design Form Pattern

## Basic Form (Create/Edit Modal)

```tsx
import { Form, Input, Modal, Select, message } from 'antd';
import { useEffect } from 'react';
import type { SupplierRequest, SupplierResponse } from '@/types';

interface SupplierFormModalProps {
  open: boolean;
  editData?: SupplierResponse | null; // null = create mode
  onClose: () => void;
  onSubmit: (values: SupplierRequest) => Promise<void>;
  isLoading?: boolean;
}

export const SupplierFormModal = ({
  open, editData, onClose, onSubmit, isLoading,
}: SupplierFormModalProps) => {
  const [form] = Form.useForm<SupplierRequest>();
  const isEdit = !!editData;

  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue(editData);
    } else {
      form.resetFields();
    }
  }, [open, editData, form]);

  const handleFinish = async (values: SupplierRequest) => {
    try {
      await onSubmit(values);
      form.resetFields();
      onClose();
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <Modal
      title={isEdit ? 'Cập nhật Nhà cung cấp' : 'Thêm Nhà cung cấp'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="code"
          label="Mã NCC"
          rules={[
            { required: true, message: 'Vui lòng nhập mã NCC' },
            { max: 50, message: 'Mã NCC tối đa 50 ký tự' },
          ]}
        >
          <Input placeholder="VD: SUP-001" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên NCC"
          rules={[{ required: true, message: 'Vui lòng nhập tên NCC' }]}
        >
          <Input placeholder="Nhập tên nhà cung cấp" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
          <Input placeholder="email@example.com" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
```

## Usage trong Page

```tsx
const [formOpen, setFormOpen] = useState(false);
const [editData, setEditData] = useState<SupplierResponse | null>(null);
const createMutation = useCreateSupplier();
const updateMutation = useUpdateSupplier();

const handleSubmit = async (values: SupplierRequest) => {
  if (editData) {
    await updateMutation.mutateAsync({ id: editData.id, data: values });
  } else {
    await createMutation.mutateAsync(values);
  }
};

<SupplierFormModal
  open={formOpen}
  editData={editData}
  onClose={() => { setFormOpen(false); setEditData(null); }}
  onSubmit={handleSubmit}
  isLoading={createMutation.isPending || updateMutation.isPending}
/>
```

## Rules
- Dùng `Form.useForm()` hook
- `layout="vertical"` cho Modal forms
- Validation rules trên mỗi `Form.Item` (mapping với backend validation)
- `destroyOnClose` trên Modal để reset form state
- `setFieldsValue` trong useEffect khi edit mode
- Form submit qua `form.submit()` → `onFinish`
- Loading state: `confirmLoading` trên Modal
