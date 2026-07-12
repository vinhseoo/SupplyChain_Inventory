import { useState } from 'react';
import { 
  Button, 
  Input, 
  Space, 
  Tag, 
  message, 
  Popconfirm, 
  Tooltip, 
  Card, 
  Select, 
  DatePicker, 
  Drawer, 
  Descriptions, 
  Table 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  FilePdfOutlined, 
  EyeOutlined,
  CheckOutlined,
  SendOutlined,
  CloseOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { 
  useTransactions, 
  useDeleteTransaction, 
  useSubmitTransaction, 
  useApproveTransaction, 
  useRejectTransaction, 
  useCompleteTransaction 
} from '../hooks/useTransactions';
import { transactionService } from '@/services/transactionService';
import { useAuthStore } from '@/stores/authStore';
import type { InventoryTransactionResponse, TransactionItemResponse } from '@/types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export const TransactionListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [dates, setDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<InventoryTransactionResponse | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch Transactions
  const params = {
    page,
    size: pageSize,
    search,
    type,
    status,
    startDate: dates?.[0] ? dates[0].startOf('day').toISOString() : undefined,
    endDate: dates?.[1] ? dates[1].endOf('day').toISOString() : undefined,
  };
  
  const { data, isLoading, refetch } = useTransactions(params);

  // Mutations
  const deleteMutation = useDeleteTransaction();
  const submitMutation = useSubmitTransaction();
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();
  const completeMutation = useCompleteTransaction();

  const handleOpenDetail = async (tx: InventoryTransactionResponse) => {
    try {
      const res = await transactionService.getById(tx.id);
      setSelectedTx(res.data);
      setDetailVisible(true);
    } catch (error) {
      message.error('Không thể lấy chi tiết phiếu kho');
    }
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      const blob = await transactionService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `phieu-kho-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Tải PDF thành công');
    } catch (error) {
      message.error('Không thể tải PDF');
    }
  };

  const handleComplete = (id: number) => {
    completeMutation.mutate(id, {
      onSuccess: () => {
        setDetailVisible(false);
        refetch();
      }
    });
  };

  const columns: ColumnsType<InventoryTransactionResponse> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (code: string, record) => (
        <a className="font-semibold text-blue-600" onClick={() => handleOpenDetail(record)}>
          {code}
        </a>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (t: string) => {
        const colors: Record<string, string> = {
          INBOUND: 'green',
          OUTBOUND: 'blue',
          TRANSFER: 'gold',
        };
        const labels: Record<string, string> = {
          INBOUND: 'Nhập kho',
          OUTBOUND: 'Xuất kho',
          TRANSFER: 'Chuyển kho',
        };
        return <Tag color={colors[t] || 'default'}>{labels[t] || t}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: string) => {
        const colors: Record<string, string> = {
          DRAFT: 'default',
          PENDING: 'warning',
          APPROVED: 'cyan',
          COMPLETED: 'success',
          CANCELLED: 'error',
        };
        return <Tag color={colors[s] || 'default'}>{s}</Tag>;
      },
    },
    {
      title: 'Kho nguồn',
      dataIndex: 'sourceWarehouseName',
      key: 'sourceWarehouseName',
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Kho đích',
      dataIndex: 'destinationWarehouseName',
      key: 'destinationWarehouseName',
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Tổng trị giá',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      render: (amount: number) => (
        <span className="font-medium text-gray-900">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
        </span>
      ),
    },
    {
      title: 'Ngày thực hiện',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        const isDraft = record.status === 'DRAFT';
        const isPending = record.status === 'PENDING';
        const isApproved = record.status === 'APPROVED';
        
        const canWrite = hasPermission('POST:/api/inventory/transactions');
        const canApprove = hasPermission('POST:/api/inventory/transactions/{id}/approve');
        
        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => handleOpenDetail(record)} 
              />
            </Tooltip>
            {isDraft && canWrite && (
              <>
                <Tooltip title="Chỉnh sửa">
                  <Button 
                    type="text" 
                    icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                    onClick={() => navigate(`/inventory/transactions/edit/${record.id}`)} 
                  />
                </Tooltip>
                <Popconfirm
                  title="Gửi duyệt phiếu kho này?"
                  onConfirm={() => submitMutation.mutate(record.id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Tooltip title="Gửi duyệt">
                    <Button type="text" icon={<SendOutlined style={{ color: '#fa8c16' }} />} />
                  </Tooltip>
                </Popconfirm>
                <Popconfirm
                  title="Xóa phiếu kho này?"
                  onConfirm={() => deleteMutation.mutate(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Xóa">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
            {isPending && canApprove && (
              <>
                <Popconfirm
                  title="Duyệt phiếu kho này?"
                  onConfirm={() => approveMutation.mutate(record.id)}
                  okText="Duyệt"
                  cancelText="Hủy"
                >
                  <Tooltip title="Duyệt phiếu">
                    <Button type="text" icon={<CheckOutlined style={{ color: '#52c41a' }} />} />
                  </Tooltip>
                </Popconfirm>
                <Popconfirm
                  title="Từ chối phiếu kho này?"
                  onConfirm={() => rejectMutation.mutate({ id: record.id, reason: 'Từ chối duyệt' })}
                  okText="Từ chối"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Từ chối">
                    <Button type="text" danger icon={<CloseOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
            {isApproved && canApprove && (
              <Popconfirm
                title="Xác nhận hoàn thành giao dịch thực tế?"
                description="Hệ thống sẽ cập nhật số dư kho hàng."
                onConfirm={() => handleComplete(record.id)}
                okText="Hoàn thành"
                cancelText="Hủy"
              >
                <Tooltip title="Thực hiện nhập/xuất kho">
                  <Button type="text" icon={<PlayCircleOutlined style={{ color: '#13c2c2' }} />} />
                </Tooltip>
              </Popconfirm>
            )}
            {(record.status === 'COMPLETED' || record.status === 'APPROVED') && (
              <Tooltip title="Tải PDF">
                <Button 
                  type="text" 
                  icon={<FilePdfOutlined style={{ color: '#ff4d4f' }} />} 
                  onClick={() => handleDownloadPdf(record.id)} 
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const detailColumns: ColumnsType<TransactionItemResponse> = [
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'SKU', dataIndex: 'productSku', key: 'productSku', width: 120 },
    { title: 'ĐVT', dataIndex: 'uomName', key: 'uomName', width: 80 },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 100, align: 'right' },
    { 
      title: 'Đơn giá', 
      dataIndex: 'price', 
      key: 'price', 
      width: 120, 
      align: 'right',
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    },
    { 
      title: 'Vị trí nguồn', 
      dataIndex: 'sourceLocationName', 
      key: 'sourceLocationName',
      render: (val) => val || <span className="text-gray-400">—</span>
    },
    { 
      title: 'Vị trí đích', 
      dataIndex: 'destinationLocationName', 
      key: 'destinationLocationName',
      render: (val) => val || <span className="text-gray-400">—</span>
    },
    { title: 'Số lô', dataIndex: 'batchNumber', key: 'batchNumber', width: 120 },
    { 
      title: 'Hạn dùng', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate', 
      width: 110,
      render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : <span className="text-gray-400">—</span>
    },
  ];

  const canWrite = hasPermission('POST:/api/inventory/transactions');

  return (
    <PageContainer title="Giao dịch kho hàng">
      <Card bordered={false} className="shadow-xs rounded-xl">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 justify-between">
            <Space wrap size="middle">
              <Input
                placeholder="Tìm kiếm mã phiếu..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 220, borderRadius: 8 }}
                allowClear
              />
              <Select
                placeholder="Loại giao dịch"
                value={type}
                onChange={setType}
                style={{ width: 150 }}
                allowClear
                options={[
                  { label: 'Nhập kho', value: 'INBOUND' },
                  { label: 'Xuất kho', value: 'OUTBOUND' },
                  { label: 'Chuyển kho', value: 'TRANSFER' },
                ]}
              />
              <Select
                placeholder="Trạng thái"
                value={status}
                onChange={setStatus}
                style={{ width: 150 }}
                allowClear
                options={[
                  { label: 'DRAFT', value: 'DRAFT' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'COMPLETED', value: 'COMPLETED' },
                  { label: 'CANCELLED', value: 'CANCELLED' },
                ]}
              />
              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dates}
                onChange={(val) => setDates(val as any)}
                style={{ borderRadius: 8 }}
              />
            </Space>
            {canWrite && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/inventory/transactions/new')}
                style={{ borderRadius: 8 }}
              >
                Tạo phiếu kho
              </Button>
            )}
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

      {/* Detail Drawer */}
      <Drawer
        title={`Chi tiết phiếu kho: ${selectedTx?.code}`}
        width={950}
        placement="right"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        extra={
          <Space>
            {selectedTx?.status === 'APPROVED' && hasPermission('POST:/api/inventory/transactions/{id}/complete') && (
              <Popconfirm
                title="Xác nhận hoàn thành giao dịch thực tế?"
                description="Cập nhật số dư kho hàng ngay lập tức."
                onConfirm={() => selectedTx && handleComplete(selectedTx.id)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button type="primary" icon={<PlayCircleOutlined />}>Hoàn thành thực tế</Button>
              </Popconfirm>
            )}
            {(selectedTx?.status === 'COMPLETED' || selectedTx?.status === 'APPROVED') && (
              <Button 
                icon={<FilePdfOutlined />} 
                danger 
                onClick={() => selectedTx && handleDownloadPdf(selectedTx.id)}
              >
                In PDF
              </Button>
            )}
          </Space>
        }
      >
        {selectedTx && (
          <div className="space-y-6">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Mã phiếu">{selectedTx.code}</Descriptions.Item>
              <Descriptions.Item label="Loại giao dịch">
                <Tag color={selectedTx.type === 'INBOUND' ? 'green' : selectedTx.type === 'OUTBOUND' ? 'blue' : 'gold'}>
                  {selectedTx.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color="cyan">{selectedTx.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{dayjs(selectedTx.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              
              {selectedTx.sourceWarehouseName && (
                <Descriptions.Item label="Kho xuất">{selectedTx.sourceWarehouseName} ({selectedTx.sourceWarehouseCode})</Descriptions.Item>
              )}
              {selectedTx.destinationWarehouseName && (
                <Descriptions.Item label="Kho nhập">{selectedTx.destinationWarehouseName} ({selectedTx.destinationWarehouseCode})</Descriptions.Item>
              )}
              {selectedTx.supplierName && (
                <Descriptions.Item label="Nhà cung cấp">{selectedTx.supplierName}</Descriptions.Item>
              )}
              <Descriptions.Item label="Tổng giá trị">
                <span className="font-bold text-red-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTx.totalAmount)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>{selectedTx.note || '—'}</Descriptions.Item>
            </Descriptions>

            <div className="space-y-2">
              <h3 className="text-md font-semibold text-gray-800">Danh sách sản phẩm</h3>
              <Table 
                columns={detailColumns} 
                dataSource={selectedTx.items} 
                rowKey="id" 
                pagination={false} 
                bordered
                size="small"
              />
            </div>
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TransactionListPage;
