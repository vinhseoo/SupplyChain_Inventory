import { useState } from 'react';
import { 
  Input, 
  Button,
  Card, 
  Select, 
  Tag 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, UndoOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { useStockLevels } from '../hooks/useStock';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { locationService } from '@/services/locationService';
import type { StockLevelResponse, LocationResponse } from '@/types';
import dayjs from 'dayjs';

export const StockLevelListPage = () => {
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const handleResetFilters = () => {
    setSearch('');
    setWarehouseId(undefined);
    setLocationId(undefined);
    setLocations([]);
    setPage(0);
  };

  // Fetch Master Data
  const { data: warehousesData } = useWarehouses({ page: 0, size: 100 });

  // Load locations dynamically
  const handleWarehouseChange = (wId: number | undefined) => {
    setWarehouseId(wId);
    setLocationId(undefined);
    if (wId) {
      locationService.getByWarehouse(wId)
        .then(res => setLocations(res.data))
        .catch(() => setLocations([]));
    } else {
      setLocations([]);
    }
  };

  // Fetch Stock Levels
  const { data, isLoading } = useStockLevels({
    page,
    size: pageSize,
    search,
    warehouseId,
    locationId
  });

  const columns: ColumnsType<StockLevelResponse> = [
    {
      title: 'Mã SP',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (code: string) => <span className="font-semibold text-gray-800">{code}</span>,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: 'SKU',
      dataIndex: 'productSku',
      key: 'productSku',
      width: 120,
    },
    {
      title: 'Kho hàng',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Vị trí',
      dataIndex: 'locationName',
      key: 'locationName',
      render: (name: string, record) => (
        <span>{name} <Tag color="blue" style={{ fontSize: '10px' }}>{record.locationCode}</Tag></span>
      )
    },
    {
      title: 'Số lô (Batch)',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
      render: (batch: string) => batch ? <Tag color="purple">{batch}</Tag> : <span className="text-gray-400">—</span>,
    },
    {
      title: 'Hạn dùng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : <span className="text-gray-400">—</span>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'right',
      render: (qty: number, record) => (
        <span className="font-bold text-gray-900">{qty} {record.uomName}</span>
      )
    },
    {
      title: 'Đang giữ hàng',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      width: 120,
      align: 'right',
      render: (res: number) => res > 0 ? <span className="text-amber-600 font-medium">{res}</span> : <span className="text-gray-400">0</span>
    },
  ];

  return (
    <PageContainer title="Báo cáo Tồn kho khả dụng">
      <Card bordered={false} className="shadow-xs rounded-xl">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Input
              placeholder="Tìm theo mã, tên, SKU sản phẩm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260, borderRadius: 8 }}
              allowClear
            />
            <Select
              placeholder="Kho hàng"
              value={warehouseId}
              onChange={handleWarehouseChange}
              style={{ width: 200 }}
              allowClear
              options={warehousesData?.content.map(w => ({ label: w.name, value: w.id }))}
            />
            <Select
              placeholder="Vị trí ô kệ"
              value={locationId}
              onChange={setLocationId}
              style={{ width: 200 }}
              allowClear
              disabled={!warehouseId}
              options={locations.map(loc => ({ label: loc.name, value: loc.id }))}
            />
            <Button 
              icon={<UndoOutlined />} 
              onClick={handleResetFilters}
              style={{ borderRadius: 8 }}
            >
              Xóa bộ lọc
            </Button>
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
    </PageContainer>
  );
};

export default StockLevelListPage;
