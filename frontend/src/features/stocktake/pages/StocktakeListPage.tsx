import { useState } from 'react';
import { 
  Input, 
  Card, 
  Select, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form 
} from 'antd';
import { SearchOutlined, UndoOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { useStocktakeSessions, useCreateStocktakeSession } from '../hooks/useStocktake';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import type { ColumnsType } from 'antd/es/table';
import type { StocktakeSessionResponse, StocktakeStatus } from '../types';

export const StocktakeListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<StocktakeStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: warehousesData } = useWarehouses({ page: 0, size: 100 });
  const { data: sessionsData, isLoading } = useStocktakeSessions({
    page,
    size: pageSize,
    search,
    warehouseId,
    status,
  });

  const createMutation = useCreateStocktakeSession();

  const handleResetFilters = () => {
    setSearch('');
    setWarehouseId(undefined);
    setStatus(undefined);
    setPage(0);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const res = await createMutation.mutateAsync(values);
      setIsModalOpen(false);
      form.resetFields();
      if (res?.data?.id) {
        navigate(`/stocktake/sessions/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: ColumnsType<StocktakeSessionResponse> = [
    {
      title: 'Mã phiên',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (code: string, record) => (
        <a onClick={() => navigate(`/stocktake/sessions/${record.id}`)} className="font-semibold text-blue-600">
          {code}
        </a>
      )
    },
    {
      title: 'Kho kiểm kê',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 200,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: StocktakeStatus) => {
        let color = 'default';
        if (status === 'DRAFT') color = 'blue';
        if (status === 'COMPLETED') color = 'orange';
        if (status === 'ADJUSTED') color = 'success';
        if (status === 'CANCELLED') color = 'error';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 140,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val: string) => val ? new Date(val).toLocaleString() : '-'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => navigate(`/stocktake/sessions/${record.id}`)}
          type="text"
        >
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <PageContainer title="Kiểm kê kho hàng">
      <Card bordered={false} className="shadow-xs rounded-xl">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Space wrap>
              <Input
                placeholder="Tìm mã phiên kiểm kê..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 220, borderRadius: 8 }}
                allowClear
              />
              <Select
                placeholder="Chọn kho hàng"
                value={warehouseId}
                onChange={setWarehouseId}
                style={{ width: 200 }}
                allowClear
                options={warehousesData?.content.map(w => ({ label: w.name, value: w.id }))}
              />
              <Select
                placeholder="Trạng thái"
                value={status}
                onChange={setStatus}
                style={{ width: 150 }}
                allowClear
                options={[
                  { label: 'DRAFT', value: 'DRAFT' },
                  { label: 'COMPLETED', value: 'COMPLETED' },
                  { label: 'ADJUSTED', value: 'ADJUSTED' },
                  { label: 'CANCELLED', value: 'CANCELLED' },
                ]}
              />
              <Button 
                icon={<UndoOutlined />} 
                onClick={handleResetFilters}
                style={{ borderRadius: 8 }}
              >
                Xóa bộ lọc
              </Button>
            </Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsModalOpen(true)}
              style={{ borderRadius: 8 }}
            >
              Khởi tạo kiểm kê
            </Button>
          </div>

          <DataTable
            columns={columns}
            dataSource={sessionsData?.content || []}
            loading={isLoading}
            pagination={{
              current: page + 1,
              pageSize,
              total: sessionsData?.totalElements || 0,
              onChange: (p, sz) => {
                setPage(p - 1);
                setPageSize(sz);
              }
            }}
          />
        </div>
      </Card>

      <Modal
        title="Khởi tạo phiên kiểm kê kho"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={handleCreate}
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="warehouseId"
            label="Kho hàng kiểm kê"
            rules={[{ required: true, message: 'Vui lòng chọn kho kiểm kê!' }]}
          >
            <Select
              placeholder="Chọn kho hàng"
              options={warehousesData?.content.map(w => ({ label: w.name, value: w.id }))}
            />
          </Form.Item>
          <Form.Item
            name="note"
            label="Ghi chú / Lý do kiểm kê"
          >
            <Input.TextArea placeholder="Nhập lý do kiểm kê, đợt kiểm kê định kỳ..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StocktakeListPage;
