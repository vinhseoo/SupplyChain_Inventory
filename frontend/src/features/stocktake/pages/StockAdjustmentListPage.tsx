import { useState } from 'react';
import { 
  Input, 
  Card, 
  Select, 
  Button, 
  Tag, 
  Space, 
  Drawer, 
  Descriptions,
  Divider,
  Typography
} from 'antd';
import { SearchOutlined, UndoOutlined, EyeOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { useStockAdjustments, useStockAdjustment } from '../hooks/useStockAdjustment';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import type { ColumnsType } from 'antd/es/table';
import type { StockAdjustmentResponse, StockAdjustmentItemResponse, StockAdjustmentStatus } from '../types';

const { Text } = Typography;

export const StockAdjustmentListPage = () => {
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<StockAdjustmentStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: warehousesData } = useWarehouses({ page: 0, size: 100 });
  const { data: adjustmentsData, isLoading } = useStockAdjustments({
    page,
    size: pageSize,
    search,
    warehouseId,
    status,
  });

  const { data: selectedAdjustment, isLoading: isDetailLoading } = useStockAdjustment(detailId || undefined);

  const handleResetFilters = () => {
    setSearch('');
    setWarehouseId(undefined);
    setStatus(undefined);
    setPage(0);
  };

  const columns: ColumnsType<StockAdjustmentResponse> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (code: string, record) => (
        <a onClick={() => setDetailId(record.id)} className="font-semibold text-blue-600">
          {code}
        </a>
      )
    },
    {
      title: 'Mã đợt kiểm kê',
      dataIndex: 'sessionCode',
      key: 'sessionCode',
      width: 180,
      render: (val: string) => val || <Text type="secondary">Điều chỉnh thủ công</Text>
    },
    {
      title: 'Kho điều chỉnh',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 200,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (val: StockAdjustmentStatus) => {
        let color = 'default';
        if (val === 'DRAFT') color = 'blue';
        if (val === 'APPROVED') color = 'success';
        if (val === 'CANCELLED') color = 'error';
        return <Tag color={color}>{val}</Tag>;
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
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
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
          onClick={() => setDetailId(record.id)}
          type="text"
        >
          Chi tiết
        </Button>
      )
    }
  ];

  const detailColumns: ColumnsType<StockAdjustmentItemResponse> = [
    {
      title: 'Mã & Tên sản phẩm',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col">
          <Text className="font-semibold">{record.productName}</Text>
          <Text type="secondary" className="text-xs">SKU: {record.productSku}</Text>
        </div>
      )
    },
    {
      title: 'Vị trí',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 120,
    },
    {
      title: 'Số lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
      render: (val: string) => val ? <Tag color="blue">{val}</Tag> : <Text type="secondary">-</Text>
    },
    {
      title: 'Trước điều chỉnh',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: 120,
      align: 'right',
      render: (qty: number, record) => `${qty} ${record.uomName}`
    },
    {
      title: 'Sau điều chỉnh',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 120,
      align: 'right',
      render: (qty: number, record) => `${qty} ${record.uomName}`
    },
    {
      title: 'Số lượng điều chỉnh',
      dataIndex: 'adjustedQuantity',
      key: 'adjustedQuantity',
      width: 120,
      align: 'right',
      render: (val: number, record) => {
        if (val > 0) return <span className="text-emerald-600 font-semibold">+{val} {record.uomName}</span>;
        return <span className="text-rose-600 font-semibold">{val} {record.uomName}</span>;
      }
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    }
  ];

  return (
    <PageContainer title="Lịch sử phiếu điều chỉnh kho">
      <Card bordered={false} className="shadow-xs rounded-xl">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Space wrap>
              <Input
                placeholder="Tìm mã phiếu..."
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
                  { label: 'APPROVED', value: 'APPROVED' },
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
          </div>

          <DataTable
            columns={columns}
            dataSource={adjustmentsData?.content || []}
            loading={isLoading}
            pagination={{
              current: page + 1,
              pageSize,
              total: adjustmentsData?.totalElements || 0,
              onChange: (p, sz) => {
                setPage(p - 1);
                setPageSize(sz);
              }
            }}
          />
        </div>
      </Card>

      <Drawer
        title={`Chi tiết phiếu điều chỉnh: ${selectedAdjustment?.code || ''}`}
        width={900}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        destroyOnClose
      >
        {isDetailLoading ? (
          <Card loading />
        ) : selectedAdjustment ? (
          <div className="space-y-6">
            <Descriptions size="small" column={2} bordered>
              <Descriptions.Item label="Mã phiếu">{selectedAdjustment.code}</Descriptions.Item>
              <Descriptions.Item label="Đợt kiểm kê">
                {selectedAdjustment.sessionCode || 'Nhập thủ công'}
              </Descriptions.Item>
              <Descriptions.Item label="Kho hàng">{selectedAdjustment.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedAdjustment.status === 'APPROVED' ? 'success' : 'blue'}>
                  {selectedAdjustment.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">{selectedAdjustment.createdBy}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{new Date(selectedAdjustment.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Lý do điều chỉnh" span={2}>{selectedAdjustment.reason}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Danh sách hàng hóa điều chỉnh</Divider>

            <DataTable
              columns={detailColumns}
              dataSource={selectedAdjustment.items || []}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        ) : null}
      </Drawer>
    </PageContainer>
  );
};

export default StockAdjustmentListPage;
