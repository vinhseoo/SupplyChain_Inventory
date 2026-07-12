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
  Tag,
  Image,
  message
} from 'antd';
import { SearchOutlined, UndoOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
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

  const handleDownloadQr = (qrText: string, fileName: string) => {
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/qr-code?text=${encodeURIComponent(qrText)}`;
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(err => {
        console.error('Failed to download QR code', err);
        message.error('Không thể tải xuống mã QR');
      });
  };

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
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20mm 15mm;
              color: #222;
            }
            .print-header {
              text-align: center;
              margin-bottom: 8mm;
              padding-bottom: 4mm;
              border-bottom: 2px solid #333;
            }
            .print-header h1 {
              font-size: 18pt;
              font-weight: 700;
              margin: 0;
            }
            .print-header p {
              font-size: 9pt;
              color: #888;
              margin-top: 2mm;
            }
            .decal-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 6mm;
            }
            .decal-card {
              border: 1.5pt dashed #999;
              border-radius: 4mm;
              padding: 5mm;
              display: flex;
              align-items: center;
              gap: 5mm;
              page-break-inside: avoid;
              background: #fff;
              min-height: 30mm;
            }
            .decal-qr {
              width: 28mm;
              height: 28mm;
              flex-shrink: 0;
              border: 0.5pt solid #eee;
              border-radius: 2mm;
            }
            .decal-info {
              flex-grow: 1;
              min-width: 0;
            }
            .decal-title {
              font-size: 11pt;
              font-weight: 700;
              margin: 0 0 2mm 0;
              color: #111;
              line-height: 1.3;
            }
            .decal-text {
              font-size: 9pt;
              margin: 1mm 0;
              color: #555;
              line-height: 1.4;
            }
            .decal-batch {
              font-weight: 700;
              color: #000;
              font-size: 10pt;
            }
            .decal-location {
              font-size: 8pt;
              color: #888;
              margin-top: 1mm;
              padding-top: 1mm;
              border-top: 0.5pt solid #eee;
            }
            @media print {
              .no-print { display: none; }
              body { padding: 10mm; }
              .decal-card { border: 1.5pt solid #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>SCIM — Nhãn Decal QR Code</h1>
            <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')} | Tổng: ${selectedRows.reduce((sum, r) => sum + (printQuantities[r.id] || 1), 0)} nhãn</p>
          </div>
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
      const qrText = row.batchNumber 
        ? `SCIM:BATCH:${row.batchNumber}:QTY:${qty}` 
        : `SCIM:PROD:${row.productSku}:QTY:${qty}`;
      const downloadFileName = row.batchNumber 
        ? `QR_${row.productSku}_${row.batchNumber}_qty${qty}.png`
        : `QR_${row.productSku}_qty${qty}.png`;

      items.push(
        <div 
          className="decal-card" 
          key={row.id}
          style={{ 
            border: '1.5px dashed #999',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#fff',
            pageBreakInside: 'avoid',
            minHeight: '120px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }} className="flex-shrink-0">
            <Image 
              className="decal-qr"
              style={{ width: '100px', height: '100px', flexShrink: 0, border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer' }}
              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/qr-code?text=${encodeURIComponent(qrText)}`} 
              alt="QR Code" 
              preview={{
                mask: <div className="text-xs">Xem to</div>
              }}
            />
            <Button 
              size="small" 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownloadQr(qrText, downloadFileName)}
              className="no-print"
              style={{ fontSize: '11px', color: '#1890ff', height: '22px', padding: '0 4px' }}
            >
              Tải ảnh
            </Button>
          </div>
          <div className="decal-info" style={{ flexGrow: 1, minWidth: 0 }}>
            <div 
              className="decal-title"
              style={{ 
                fontSize: '14px', 
                fontWeight: 700, 
                margin: '0 0 6px 0', 
                color: '#111',
                lineHeight: 1.3
              }}
            >
              {row.productName}
            </div>
            <div className="decal-text" style={{ fontSize: '12px', margin: '3px 0', color: '#555' }}>SKU: {row.productSku}</div>
            {row.batchNumber && (
              <div className="decal-batch" style={{ fontSize: '13px', margin: '3px 0', fontWeight: 700, color: '#000' }}>
                Lô: {row.batchNumber}
              </div>
            )}
            <div style={{ fontSize: '13px', margin: '3px 0', fontWeight: 700, color: '#1890ff' }}>
              Số lượng: {qty}
            </div>
            {row.expiryDate && (
              <div className="decal-text" style={{ fontSize: '12px', margin: '3px 0', color: '#555' }}>
                HSD: {new Date(row.expiryDate).toLocaleDateString('vi-VN')}
              </div>
            )}
            <div className="decal-location" style={{ fontSize: '11px', margin: '4px 0 0 0', color: '#888', paddingTop: '4px', borderTop: '1px solid #eee' }}>
              📍 {row.warehouseName} — {row.locationName}
            </div>
          </div>
        </div>
      );
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
        width={960}
        destroyOnClose
      >
        <div className="p-4 bg-gray-50 rounded-lg max-h-[600px] overflow-y-auto mt-2">
          <div className="grid grid-cols-2 gap-4" id="decal-print-area">
            {renderDecalItems()}
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default BatchQrPrintPage;
