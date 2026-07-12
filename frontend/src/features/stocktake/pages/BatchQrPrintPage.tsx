import { useState } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Table, 
  InputNumber, 
  Space, 
  Modal, 
  Typography,
  Tag
} from 'antd';
import { SearchOutlined, UndoOutlined, PrinterOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { useStockLevels } from '@/features/inventory/hooks/useStock';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import type { ColumnsType } from 'antd/es/table';
import type { StockLevelResponse } from '@/types';

const { Text } = Typography;

export const BatchQrPrintPage = () => {
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<StockLevelResponse[]>([]);

  const [printQuantities, setPrintQuantities] = useState<Record<number, number>>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const { data: warehousesData } = useWarehouses({ page: 0, size: 100 });
  const { data: stockData, isLoading } = useStockLevels({
    page,
    size: pageSize,
    search,
    warehouseId,
  });

  const handleResetFilters = () => {
    setSearch('');
    setWarehouseId(undefined);
    setPage(0);
  };

  const handleSelectChange = (keys: React.Key[], rows: StockLevelResponse[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);

    const updatedQuantities = { ...printQuantities };
    rows.forEach(row => {
      if (updatedQuantities[row.id] === undefined) {
        updatedQuantities[row.id] = 1;
      }
    });
    setPrintQuantities(updatedQuantities);
  };

  const handleQtyChange = (id: number, val: number | null) => {
    setPrintQuantities({
      ...printQuantities,
      [id]: val || 1
    });
  };

  const handleOpenPrintPreview = () => {
    if (selectedRows.length === 0) {
      alert('Vui lòng chọn ít nhất một lô hàng để in!');
      return;
    }
    setIsPrintModalOpen(true);
  };

  const handleTriggerPrint = () => {
    const printContent = document.getElementById('decal-print-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>In nhãn Decal QR Code</title>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              margin: 0;
              padding: 10px;
            }
            .decal-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .decal-card {
              border: 1px dashed #ccc;
              border-radius: 8px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              page-break-inside: avoid;
              box-sizing: border-box;
            }
            .decal-qr {
              width: 80px;
              height: 80px;
              flex-shrink: 0;
            }
            .decal-info {
              flex-grow: 1;
              min-width: 0;
            }
            .decal-title {
              font-size: 11px;
              font-weight: bold;
              margin: 0 0 4px 0;
              color: #333;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .decal-text {
              font-size: 9px;
              margin: 2px 0;
              color: #666;
            }
            .decal-batch {
              font-weight: bold;
              color: #000;
            }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
              .decal-card { border: 1px solid #ddd; }
            }
          </style>
        </head>
        <body>
          <div class="decal-grid">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns: ColumnsType<StockLevelResponse> = [
    {
      title: 'Sản phẩm/SKU',
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
      title: 'Số lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 140,
      render: (val: string) => val ? <Tag color="blue">{val}</Tag> : <Text type="secondary">N/A</Text>
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 130,
      render: (val: string) => val ? new Date(val).toLocaleDateString() : '-'
    },
    {
      title: 'Kho & Vị trí',
      key: 'location',
      width: 220,
      render: (_, record) => `${record.warehouseName} - ${record.locationName}`
    },
    {
      title: 'Số lượng nhãn',
      key: 'printQty',
      width: 120,
      render: (_, record) => {
        const isSelected = selectedRowKeys.includes(record.id);
        return (
          <InputNumber
            min={1}
            value={printQuantities[record.id] || 1}
            onChange={(val) => handleQtyChange(record.id, val)}
            disabled={!isSelected}
            style={{ width: 80 }}
          />
        );
      }
    }
  ];

  const renderDecalItems = () => {
    const items: React.ReactNode[] = [];
    selectedRows.forEach(row => {
      const qty = printQuantities[row.id] || 1;
      const qrText = row.batchNumber ? `SCIM:BATCH:${row.batchNumber}` : `SCIM:PROD:${row.productSku}`;
      
      for (let i = 0; i < qty; i++) {
        items.push(
          <div 
            className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-white" 
            key={`${row.id}-${i}`}
            style={{ pageBreakInside: 'avoid' }}
          >
            <img 
              style={{ width: '80px', height: '80px', flexShrink: 0 }}
              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/qr-code?text=${encodeURIComponent(qrText)}`} 
              alt="QR Code" 
            />
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div 
                style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0', 
                  color: '#333',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {row.productName}
              </div>
              <div style={{ fontSize: '9px', margin: '2px 0', color: '#666' }}>SKU: {row.productSku}</div>
              {row.batchNumber && (
                <div style={{ fontSize: '9px', margin: '2px 0', fontWeight: 'bold', color: '#000' }}>
                  Lô: {row.batchNumber}
                </div>
              )}
              {row.expiryDate && (
                <div style={{ fontSize: '9px', margin: '2px 0', color: '#666' }}>
                  HSD: {new Date(row.expiryDate).toLocaleDateString()}
                </div>
              )}
              <div style={{ fontSize: '9px', margin: '2px 0', color: '#666' }}>
                {row.warehouseCode} - {row.locationCode}
              </div>
            </div>
          </div>
        );
      }
    });
    return items;
  };

  return (
    <PageContainer title="In nhãn QR Code lô hàng hàng loạt">
      <div className="space-y-4">
        <Card bordered={false} className="shadow-xs rounded-xl">
          <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
            <Space wrap>
              <Input
                placeholder="Tìm mã, tên, SKU sản phẩm..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 260, borderRadius: 8 }}
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
              icon={<PrinterOutlined />} 
              disabled={selectedRowKeys.length === 0}
              onClick={handleOpenPrintPreview}
              style={{ borderRadius: 8 }}
            >
              In nhãn đã chọn ({selectedRowKeys.length})
            </Button>
          </div>

          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: handleSelectChange,
            }}
            columns={columns}
            dataSource={stockData?.content || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: page + 1,
              pageSize,
              total: stockData?.totalElements || 0,
              onChange: (p, sz) => {
                setPage(p - 1);
                setPageSize(sz);
              }
            }}
            className="mt-4"
          />
        </Card>
      </div>

      <Modal
        title="Xem trước Decal in nhãn"
        open={isPrintModalOpen}
        onCancel={() => setIsPrintModalOpen(false)}
        onOk={handleTriggerPrint}
        okText="Bắt đầu in"
        cancelText="Đóng"
        width={850}
        destroyOnClose
      >
        <div className="p-4 bg-gray-50 rounded-lg max-h-[500px] overflow-y-auto mt-2">
          <div className="grid grid-cols-3 gap-3" id="decal-print-area">
            {renderDecalItems()}
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default BatchQrPrintPage;
