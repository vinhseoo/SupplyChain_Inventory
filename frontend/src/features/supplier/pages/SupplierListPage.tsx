import { useState } from 'react';
import { 
  Button, 
  Input, 
  Space, 
  Form, 
  Tag, 
  message, 
  Popconfirm,
  Tooltip,
  Card
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  DownloadOutlined 
} from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { FormModal } from '@/components/common/FormModal';
import { 
  useSuppliers, 
  useCreateSupplier, 
  useUpdateSupplier, 
  useDeleteSupplier 
} from '../hooks/useSuppliers';
import { supplierService } from '@/services/supplierService';
import { useAuthStore } from '@/stores/authStore';
import type { SupplierResponse, SupplierRequest } from '@/types';
import dayjs from 'dayjs';

export const SupplierListPage = () => {
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierResponse | null>(null);
  
  const [form] = Form.useForm();
  
  // Fetch Suppliers
  const { data, isLoading } = useSuppliers({ page, size: pageSize, search });
  
  // Mutations
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();
  
  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    form.resetFields();
    setIsModalOpen(true);
  };
  
  const handleOpenEdit = (record: SupplierResponse) => {
    setSelectedSupplier(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      contactName: record.contactName,
      email: record.email,
      phone: record.phone,
      taxCode: record.taxCode,
      address: record.address,
      note: record.note,
      isActive: record.isActive,
    });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
    form.resetFields();
  };
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: SupplierRequest = {
        ...values,
        isActive: selectedSupplier ? values.isActive : true,
      };
      
      if (selectedSupplier) {
        updateMutation.mutate(
          { id: selectedSupplier.id, data: payload },
          {
            onSuccess: () => handleCloseModal(),
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => handleCloseModal(),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleExport = async () => {
    try {
      const blob = await supplierService.exportExcel(search);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'suppliers.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Xuất file Excel thành công');
    } catch (error) {
      message.error('Không thể xuất file Excel.');
    }
  };
  
  const columns: ColumnsType<SupplierResponse> = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <span className="font-semibold text-gray-800">{code}</span>,
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => <span className="font-medium text-gray-900">{name}</span>,
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 150,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      key: 'taxCode',
      width: 120,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 6 }}>
          {isActive ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];
  
  const canWrite = hasPermission('POST:/api/suppliers');
  const canEdit = hasPermission('PUT:/api/suppliers/{id}');
  const canDelete = hasPermission('DELETE:/api/suppliers/{id}');
  const canExport = hasPermission('GET:/api/suppliers/export');
  
  if (canEdit || canDelete) {
    columns.push({
      title: 'Hành động',
      key: 'action',
      width: 110,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {canEdit && (
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                onClick={() => handleOpenEdit(record)} 
              />
            </Tooltip>
          )}
          {record.isActive && canDelete && (
            <Popconfirm
              title="Ngừng hoạt động nhà cung cấp này?"
              description="Hệ thống sẽ ghi nhận trạng thái ngừng giao dịch."
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => deleteMutation.mutate(record.id)}
            >
              <Tooltip title="Ngừng hoạt động">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }
  
  return (
    <PageContainer title="Danh mục Nhà cung cấp">
      <Card bordered={false} className="shadow-xs rounded-xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Input
              placeholder="Tìm theo mã, tên, số điện thoại..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 320, borderRadius: 8 }}
              allowClear
            />
            <Space>
              {canExport && (
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={handleExport}
                  style={{ borderRadius: 8 }}
                >
                  Xuất Excel
                </Button>
              )}
              {canWrite && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleOpenCreate}
                  style={{ borderRadius: 8 }}
                >
                  Thêm nhà cung cấp
                </Button>
              )}
            </Space>
          </div>
          
          <DataTable
            columns={columns}
            dataSource={data?.content || []}
            loading={isLoading}
            pagination={{
              total: data?.totalElements || 0,
              pageSize: pageSize,
              current: page + 1,
              onChange: (p, size) => {
                setPage(p - 1);
                if (size) setPageSize(size);
              },
            }}
          />
        </div>
      </Card>
      
      {/* Create/Edit Modal */}
      <FormModal
        title={selectedSupplier ? "Cập nhật Nhà cung cấp" : "Thêm mới Nhà cung cấp"}
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Mã nhà cung cấp"
              rules={[
                { required: true, message: 'Mã nhà cung cấp không được để trống' },
                { max: 50, message: 'Không vượt quá 50 ký tự' }
              ]}
            >
              <Input placeholder="E.g. SUP-001" disabled={!!selectedSupplier} />
            </Form.Item>
            
            <Form.Item
              name="name"
              label="Tên nhà cung cấp"
              rules={[
                { required: true, message: 'Tên nhà cung cấp không được để trống' },
                { max: 200, message: 'Không vượt quá 200 ký tự' }
              ]}
            >
              <Input placeholder="Công ty TNHH Giải pháp Chuỗi cung ứng" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="contactName"
              label="Người liên hệ"
              rules={[{ max: 150, message: 'Không vượt quá 150 ký tự' }]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ max: 50, message: 'Không vượt quá 50 ký tự' }]}
            >
              <Input placeholder="09xxxxxxx" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Email không đúng định dạng' },
                { max: 150, message: 'Không vượt quá 150 ký tự' }
              ]}
            >
              <Input placeholder="contact@supplier.com" />
            </Form.Item>
            
            <Form.Item
              name="taxCode"
              label="Mã số thuế"
              rules={[{ max: 50, message: 'Không vượt quá 50 ký tự' }]}
            >
              <Input placeholder="0101234567" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ max: 500, message: 'Không vượt quá 500 ký tự' }]}
          >
            <Input.TextArea rows={2} placeholder="Số 1, Đường 2, Quận 3, TP. Hồ Chí Minh" />
          </Form.Item>
          
          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Các thông tin bổ sung khác..." />
          </Form.Item>
        </Form>
      </FormModal>
    </PageContainer>
  );
};

export default SupplierListPage;
