import { useState } from 'react';
import { 
  Button,
  Card, 
  Select, 
  DatePicker, 
  Tag 
} from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { useStockCard } from '../hooks/useStock';
import { useProducts } from '@/features/product/hooks/useProducts';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { locationService } from '@/services/locationService';
import type { StockMovementResponse, LocationResponse } from '@/types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export const StockCardPage = () => {
  const [productId, setProductId] = useState<number | undefined>(undefined);
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [dates, setDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const handleResetFilters = () => {
    setProductId(undefined);
    setWarehouseId(undefined);
    setLocationId(undefined);
    setLocations([]);
    setDates(null);
    setPage(0);
  };

  // Fetch Master Data
  const { data: productsData } = useProducts({ page: 0, size: 200 });
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

  // Fetch Stock Card
  const { data, isLoading } = useStockCard({
    page,
    size: pageSize,
    productId,
    warehouseId,
    locationId,
    startDate: dates?.[0] ? dates[0].startOf('day').toISOString() : undefined,
    endDate: dates?.[1] ? dates[1].endOf('day').toISOString() : undefined,
  });

  const columns: ColumnsType<StockMovementResponse> = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record) => (
        <div>
          <span className="font-semibold">{name}</span>
          <br />
          <span className="text-gray-400 text-xs">{record.productSku}</span>
        </div>
      )
    },
    {
      title: 'Kho / Vị trí',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (wName: string, record) => (
        <span>{wName} / <Tag color="blue">{record.locationName}</Tag></span>
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
      title: 'Loại biến động',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (t: string) => {
        const colors: Record<string, string> = {
          INBOUND: 'green',
          OUTBOUND: 'red',
          TRANSFER_IN: 'cyan',
          TRANSFER_OUT: 'orange',
          ADJUSTMENT: 'purple',
        };
        const labels: Record<string, string> = {
          INBOUND: 'Nhập kho',
          OUTBOUND: 'Xuất kho',
          TRANSFER_IN: 'Nhận chuyển kho',
          TRANSFER_OUT: 'Xuất chuyển kho',
          ADJUSTMENT: 'Điều chỉnh',
        };
        return <Tag color={colors[t] || 'default'}>{labels[t] || t}</Tag>;
      }
    },
    {
      title: 'Mã chứng từ',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      width: 130,
      render: (code: string) => code || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Số lượng thay đổi',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 130,
      align: 'right',
      render: (qty: number, record) => {
        const isPos = qty > 0;
        return (
          <span className={`font-bold ${isPos ? 'text-green-600' : 'text-red-600'}`}>
            {isPos ? `+${qty}` : qty} {record.uomName}
          </span>
        );
      }
    },
    {
      title: 'Tồn trước',
      dataIndex: 'balanceBefore',
      key: 'balanceBefore',
      width: 100,
      align: 'right',
    },
    {
      title: 'Tồn sau',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 100,
      align: 'right',
      render: (val: number) => <span className="font-semibold text-gray-900">{val}</span>
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 130,
    },
  ];

  return (
    <PageContainer title="Thẻ kho & Lịch sử biến động tồn kho (Stock Card)">
      <Card bordered={false} className="shadow-xs rounded-xl">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Select
              showSearch
              placeholder="Chọn hàng hóa..."
              value={productId}
              onChange={setProductId}
              style={{ width: 220 }}
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={productsData?.content.map(p => ({
                value: p.id,
                label: `${p.name} (${p.sku})`
              }))}
            />
            <Select
              placeholder="Kho hàng"
              value={warehouseId}
              onChange={handleWarehouseChange}
              style={{ width: 180 }}
              allowClear
              options={warehousesData?.content.map(w => ({ label: w.name, value: w.id }))}
            />
            <Select
              placeholder="Vị trí ô kệ"
              value={locationId}
              onChange={setLocationId}
              style={{ width: 180 }}
              allowClear
              disabled={!warehouseId}
              options={locations.map(loc => ({ label: loc.name, value: loc.id }))}
            />
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dates}
              onChange={(val) => setDates(val as any)}
              style={{ borderRadius: 8 }}
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

export default StockCardPage;
