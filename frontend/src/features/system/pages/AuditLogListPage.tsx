import { useState } from 'react';
import { Table, Tabs, Input, Select, Button, Modal, Tag, Row, Col, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, HistoryOutlined, DatabaseOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { useActivityLogs, useAuditLogs } from '../hooks/useAuditLogs';
import type { ColumnsType } from 'antd/es/table';
import type { ActivityLogResponse, AuditLogResponse } from '@/services/auditService';

const { Title, Text } = Typography;

export const AuditLogListPage = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'audit'>('activity');

  // Activity Logs States
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 10;

  const { data: activityData, isLoading: isActivityLoading } = useActivityLogs({
    page: activityPage - 1,
    size: activityPageSize,
    search: activitySearch || undefined
  });

  // Audit Logs States
  const [auditEntity, setAuditEntity] = useState<string | undefined>(undefined);
  const [auditAction, setAuditAction] = useState<string | undefined>(undefined);
  const [auditPage, setAuditPage] = useState(1);
  const auditPageSize = 10;

  const { data: auditData, isLoading: isAuditLoading } = useAuditLogs({
    page: auditPage - 1,
    size: auditPageSize,
    entityName: auditEntity || undefined,
    action: auditAction || undefined
  });

  // Modal State for JSON diff viewer
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogResponse | null>(null);

  const formatJson = (jsonStr: string | null) => {
    if (!jsonStr) return 'N/A';
    try {
      // Check if it's already a clean object or raw string
      const parsed = JSON.parse(jsonStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonStr;
    }
  };

  const handleOpenDetail = (record: AuditLogResponse) => {
    setSelectedAuditLog(record);
    setIsDetailModalOpen(true);
  };

  const activityColumns: ColumnsType<ActivityLogResponse> = [
    {
      title: 'Mã số',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Mô tả hoạt động',
      dataIndex: 'description',
      key: 'description',
      render: (val: string) => <span className="font-medium text-gray-800">{val}</span>
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
      render: (val: string) => <Tag color="blue">{val || 'N/A'}</Tag>
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 180,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val: string) => new Date(val).toLocaleString()
    }
  ];

  const getActionTagColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'blue';
      case 'DELETE': return 'red';
      default: return 'gray';
    }
  };

  const auditColumns: ColumnsType<AuditLogResponse> = [
    {
      title: 'Mã số',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Tên thực thể',
      dataIndex: 'entityName',
      key: 'entityName',
      width: 160,
      render: (val: string) => <Text className="font-semibold text-blue-600">{val}</Text>
    },
    {
      title: 'ID thực thể',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 120,
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (val: string) => <Tag color={getActionTagColor(val)}>{val}</Tag>
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 160,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val: string) => new Date(val).toLocaleString()
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => handleOpenDetail(record)}
          className="text-blue-500 hover:text-blue-700"
        >
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <PageContainer title="Nhật ký hệ thống">
      <div className="space-y-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as any)}
          className="bg-white p-6 rounded-xl shadow-xs border border-gray-100"
          items={[
            {
              key: 'activity',
              label: (
                <span className="flex items-center gap-2">
                  <HistoryOutlined />
                  <span>Nhật ký Hoạt động</span>
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                    <Input
                      placeholder="Tìm kiếm hành động, người thực hiện..."
                      prefix={<SearchOutlined />}
                      value={activitySearch}
                      onChange={(e) => {
                        setActivitySearch(e.target.value);
                        setActivityPage(1);
                      }}
                      style={{ width: 300, borderRadius: 8 }}
                      allowClear
                    />
                  </div>

                  <Table
                    columns={activityColumns}
                    dataSource={activityData?.content || []}
                    loading={isActivityLoading}
                    rowKey="id"
                    pagination={{
                      current: activityPage,
                      pageSize: activityPageSize,
                      total: activityData?.totalElements || 0,
                      onChange: (p) => setActivityPage(p),
                    }}
                    className="border border-gray-100 rounded-lg overflow-hidden"
                  />
                </div>
              )
            },
            {
              key: 'audit',
              label: (
                <span className="flex items-center gap-2">
                  <DatabaseOutlined />
                  <span>Nhật ký Thay đổi Dữ liệu (Audit Trail)</span>
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                    <Select
                      placeholder="Lọc theo thực thể"
                      style={{ width: 200, borderRadius: 8 }}
                      value={auditEntity}
                      onChange={(val) => {
                        setAuditEntity(val);
                        setAuditPage(1);
                      }}
                      allowClear
                    >
                      <Select.Option value="Product">Sản phẩm (Product)</Select.Option>
                      <Select.Option value="Supplier">Nhà cung cấp (Supplier)</Select.Option>
                      <Select.Option value="Warehouse">Kho hàng (Warehouse)</Select.Option>
                      <Select.Option value="Location">Vị trí kệ (Location)</Select.Option>
                      <Select.Option value="SystemSetting">Cấu hình (SystemSetting)</Select.Option>
                      <Select.Option value="StocktakeSession">Phiên kiểm kê</Select.Option>
                      <Select.Option value="StockAdjustment">Phiếu điều chỉnh</Select.Option>
                    </Select>

                    <Select
                      placeholder="Thao tác"
                      style={{ width: 150, borderRadius: 8 }}
                      value={auditAction}
                      onChange={(val) => {
                        setAuditAction(val);
                        setAuditPage(1);
                      }}
                      allowClear
                    >
                      <Select.Option value="CREATE">CREATE</Select.Option>
                      <Select.Option value="UPDATE">UPDATE</Select.Option>
                      <Select.Option value="DELETE">DELETE</Select.Option>
                    </Select>
                  </div>

                  <Table
                    columns={auditColumns}
                    dataSource={auditData?.content || []}
                    loading={isAuditLoading}
                    rowKey="id"
                    pagination={{
                      current: auditPage,
                      pageSize: auditPageSize,
                      total: auditData?.totalElements || 0,
                      onChange: (p) => setAuditPage(p),
                    }}
                    className="border border-gray-100 rounded-lg overflow-hidden"
                  />
                </div>
              )
            }
          ]}
        />

        <Modal
          title={
            <Title level={4} style={{ margin: 0 }}>
              Chi tiết Thay đổi Dữ liệu #{selectedAuditLog?.id}
            </Title>
          }
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
              Đóng
            </Button>
          ]}
          width={850}
          destroyOnClose
        >
          {selectedAuditLog && (
            <div className="space-y-4 mt-4">
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex justify-between">
                <div>
                  <strong>Thực thể:</strong> {selectedAuditLog.entityName} (ID: {selectedAuditLog.entityId})
                </div>
                <div>
                  <strong>Thao tác:</strong> <Tag color={getActionTagColor(selectedAuditLog.action)}>{selectedAuditLog.action}</Tag>
                </div>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <Title level={5} className="text-gray-500 mb-2">Giá trị trước thay đổi (Old Value)</Title>
                    <pre className="bg-[#1e1e1e] text-red-300 p-4 rounded-lg text-[11px] overflow-auto max-h-[350px] font-mono whitespace-pre-wrap">
                      {formatJson(selectedAuditLog.oldValue)}
                    </pre>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <Title level={5} className="text-gray-500 mb-2">Giá trị sau thay đổi (New Value)</Title>
                    <pre className="bg-[#1e1e1e] text-green-300 p-4 rounded-lg text-[11px] overflow-auto max-h-[350px] font-mono whitespace-pre-wrap">
                      {formatJson(selectedAuditLog.newValue)}
                    </pre>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </PageContainer>
  );
};

export default AuditLogListPage;
