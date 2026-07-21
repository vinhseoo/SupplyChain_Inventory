import { useState } from 'react';
import { 
  Card, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  InputNumber, 
  Popconfirm, 
  Typography, 
  Descriptions,
  Empty
} from 'antd';
import { 
  ScanOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  SwapOutlined,
  EditOutlined,
  SaveOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { 
  useStocktakeSession, 
  useUpdateStocktakeItemQty, 
  useDeleteStocktakeItem,
  useScanBarcode, 
  useCompleteStocktakeSession, 
  useCancelStocktakeSession,
  useCreateAdjustmentFromStocktake
} from '../hooks/useStocktake';
import { locationService } from '@/services/locationService';
import { ScannerModal } from '../components/ScannerModal';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import type { StocktakeItemResponse } from '../types';
import type { LocationResponse } from '@/types';

const { Text } = Typography;

export const StocktakeSessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sessionId = Number(id);

  const [scanInput, setScanInput] = useState('');
  const [scanLocationId, setScanLocationId] = useState<number | undefined>(undefined);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingQty, setEditingQty] = useState<number>(0);

  // Fetch session data
  const { data: session, isLoading } = useStocktakeSession(sessionId);

  // Fetch warehouse locations for scanning target
  const { data: locationsData } = useQuery<LocationResponse[]>({
    queryKey: ['locations', session?.warehouseId],
    queryFn: async () => {
      if (!session?.warehouseId) return [];
      const res = await locationService.getByWarehouse(session.warehouseId);
      return res.data;
    },
    enabled: !!session?.warehouseId,
  });

  // Mutations
  const updateQtyMutation = useUpdateStocktakeItemQty();
  const deleteItemMutation = useDeleteStocktakeItem();
  const scanBarcodeMutation = useScanBarcode();
  const completeMutation = useCompleteStocktakeSession();
  const cancelMutation = useCancelStocktakeSession();
  const adjustMutation = useCreateAdjustmentFromStocktake();

  const handleManualScanSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      triggerScan(scanInput);
    }
  };

  const triggerScan = (code: string) => {
    if (!code.trim()) return;
    if (!scanLocationId) {
      alert('Vui lòng chọn vị trí quét trước!');
      return;
    }
    scanBarcodeMutation.mutate({
      id: sessionId,
      data: {
        code: code.trim(),
        locationId: scanLocationId
      }
    }, {
      onSuccess: () => {
        setScanInput('');
      }
    });
  };

  const handleInlineEditStart = (item: StocktakeItemResponse) => {
    setEditingItemId(item.id);
    setEditingQty(Math.round(item.actualQuantity));
  };

  const handleInlineEditSave = (itemId: number) => {
    updateQtyMutation.mutate({
      id: sessionId,
      itemId,
      data: {
        actualQuantity: Math.round(editingQty),
      }
    }, {
      onSuccess: () => {
        setEditingItemId(null);
      }
    });
  };

  const handleDeleteItem = (itemId: number) => {
    deleteItemMutation.mutate({
      id: sessionId,
      itemId
    });
  };

  const handleComplete = () => {
    completeMutation.mutate(sessionId);
  };

  const handleCancel = () => {
    cancelMutation.mutate(sessionId);
  };

  const handleAdjust = () => {
    adjustMutation.mutate(sessionId, {
      onSuccess: (res) => {
        if (res?.data?.id) {
          navigate(`/stocktake/adjustments`);
        }
      }
    });
  };

  const isEditable = session?.status === 'DRAFT';

  const columns: ColumnsType<StocktakeItemResponse> = [
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
      width: 140,
    },
    {
      title: 'Số lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 140,
      render: (val: string) => val ? <Tag color="blue">{val}</Tag> : <Text type="secondary">-</Text>
    },
    {
      title: 'Tồn hệ thống',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: 130,
      align: 'right',
      render: (qty: number, record) => (
        <span className="font-medium text-gray-600">
          {Math.round(qty)} {record.uomName}
        </span>
      )
    },
    {
      title: 'Thực tế đếm',
      key: 'actualQuantity',
      width: 160,
      align: 'right',
      render: (_, record) => {
        if (editingItemId === record.id) {
          return (
            <InputNumber
              min={0}
              step={1}
              precision={0}
              value={editingQty}
              onChange={(val) => setEditingQty(val !== null ? Math.round(val) : 0)}
              style={{ width: 90 }}
              onPressEnter={() => handleInlineEditSave(record.id)}
            />
          );
        }
        return (
          <span className="font-semibold text-gray-800">
            {Math.round(record.actualQuantity)} {record.uomName}
          </span>
        );
      }
    },
    {
      title: 'Chênh lệch',
      dataIndex: 'variance',
      key: 'variance',
      width: 130,
      align: 'right',
      render: (val: number, record) => {
        const roundedVal = Math.round(val);
        if (roundedVal === 0) return <span className="text-gray-400">0</span>;
        if (roundedVal > 0) return <span className="text-emerald-600 font-semibold">+{roundedVal} {record.uomName}</span>;
        return <span className="text-rose-600 font-semibold">{roundedVal} {record.uomName}</span>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (!isEditable) return null;
        if (editingItemId === record.id) {
          return (
            <Button 
              icon={<SaveOutlined />} 
              onClick={() => handleInlineEditSave(record.id)}
              type="primary"
              size="small"
            />
          );
        }
        return (
          <Space size="small">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleInlineEditStart(record)}
              type="text"
              size="small"
              title="Sửa số lượng"
            />
            <Popconfirm
              title="Xóa dòng kiểm kê?"
              description="Sản phẩm này sẽ bị xóa khỏi phiên kiểm kê."
              onConfirm={() => handleDeleteItem(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button 
                icon={<DeleteOutlined />} 
                danger
                type="text"
                size="small"
                title="Xóa dòng"
              />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  if (isLoading) {
    return <PageContainer title="Chi tiết kiểm kê"><Card loading /></PageContainer>;
  }

  if (!session) {
    return <PageContainer title="Chi tiết kiểm kê"><Card><Empty description="Không tìm thấy phiên kiểm kê" /></Card></PageContainer>;
  }

  // Pre-select first location for scanning target if not selected
  if (!scanLocationId && locationsData && locationsData.length > 0) {
    setScanLocationId(locationsData[0].id);
  }

  return (
    <PageContainer title={`Phiên kiểm kê: ${session.code}`}>
      <div className="space-y-6">
        {/* Session Header Card */}
        <Card bordered={false} className="shadow-xs rounded-xl">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-2">
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="Kho kiểm kê"><b>{session.warehouseName}</b></Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={
                    session.status === 'DRAFT' ? 'blue' : 
                    session.status === 'COMPLETED' ? 'orange' : 
                    session.status === 'ADJUSTED' ? 'success' : 'error'
                  }>
                    {session.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">{session.createdBy}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{new Date(session.createdAt).toLocaleString()}</Descriptions.Item>
                {session.note && <Descriptions.Item label="Ghi chú" span={2}>{session.note}</Descriptions.Item>}
              </Descriptions>
            </div>

            <Space wrap>
              {session.status === 'DRAFT' && (
                <>
                  <Button 
                    type="primary" 
                    icon={<ScanOutlined />} 
                    onClick={() => setCameraVisible(true)}
                    style={{ borderRadius: 8 }}
                  >
                    Quét bằng Camera
                  </Button>
                  <Popconfirm
                    title="Xác nhận hoàn thành quét?"
                    description="Sau khi hoàn thành, số liệu kiểm kê sẽ được chốt để tạo phiếu điều chỉnh."
                    onConfirm={handleComplete}
                    okText="Đồng ý"
                    cancelText="Hủy"
                  >
                    <Button type="default" icon={<CheckOutlined />} className="bg-amber-50 text-amber-600 border-amber-200">
                      Chốt số liệu (Complete)
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Hủy bỏ phiên kiểm kê này?"
                    description="Toàn bộ kết quả quét kiểm kê sẽ bị xóa bỏ."
                    onConfirm={handleCancel}
                    okText="Hủy phiên"
                    cancelText="Giữ lại"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<CloseOutlined />}>
                      Hủy phiên
                    </Button>
                  </Popconfirm>
                </>
              )}

              {session.status === 'COMPLETED' && (
                <>
                  <Popconfirm
                    title="Khởi tạo phiếu điều chỉnh kho?"
                    description="Hệ thống sẽ tự động cập nhật số lượng tồn kho theo số thực tế và ghi nhận Thẻ kho."
                    onConfirm={handleAdjust}
                    okText="Tạo & Cập nhật"
                    cancelText="Quay lại"
                  >
                    <Button type="primary" icon={<SwapOutlined />} className="bg-emerald-600 border-emerald-600 hover:bg-emerald-700">
                      Tạo phiếu điều chỉnh (Adjustment)
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Hủy bỏ phiên kiểm kê này?"
                    onConfirm={handleCancel}
                    okText="Hủy phiên"
                    cancelText="Quay lại"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<CloseOutlined />}>
                      Hủy phiên
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          </div>
        </Card>

        {/* Scan Barcode Section (Only for DRAFT) */}
        {isEditable && (
          <Card title="Bàn quét Barcode / QR Code" size="small" className="shadow-xs rounded-xl">
            <div className="flex flex-wrap gap-4 items-center">
              <div style={{ width: 250 }}>
                <div className="text-xs text-gray-400 mb-1">Vị trí đứng quét (bắt buộc)</div>
                <Select
                  placeholder="Chọn vị trí đứng quét"
                  value={scanLocationId}
                  onChange={setScanLocationId}
                  style={{ width: '100%' }}
                  options={locationsData?.map((loc: LocationResponse) => ({ label: loc.name, value: loc.id }))}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs text-gray-400 mb-1">Mã quét / SKU sản phẩm (Nhấn Enter để nhập)</div>
                <Input
                  placeholder="Nhập mã SKU, Barcode sản phẩm hoặc quét mã QR lô hàng..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={handleManualScanSubmit}
                  suffix={
                    <Button type="primary" size="small" onClick={() => triggerScan(scanInput)}>
                      Nhập
                    </Button>
                  }
                />
              </div>
            </div>
          </Card>
        )}

        {/* Items Table */}
        <Card title="Danh sách chi tiết kiểm đếm" bordered={false} className="shadow-xs rounded-xl">
          <DataTable
            columns={columns}
            dataSource={session.items || []}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Card>
      </div>

      <ScannerModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onScanSuccess={triggerScan}
      />
    </PageContainer>
  );
};

export default StocktakeSessionPage;
