import { useState } from 'react';
import type { FC } from 'react';
import { Table, Card, Button, Radio, Space, Typography, Tag } from 'antd';
import { FileExcelOutlined, CalendarOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { useSlowMovingInventory } from '../hooks/useAnalytics';

const { Text } = Typography;

export const SlowMovingReportPage: FC = () => {
  const [daysInactive, setDaysInactive] = useState<number>(30);
  const { data, isLoading } = useSlowMovingInventory(daysInactive);

  // Format currency
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (!data || data.length === 0) return;
    const headers = ['Mã sản phẩm', 'Tên sản phẩm', 'SKU', 'Đơn giá', 'Tồn kho hiện tại', 'Ngày biến động cuối', 'Số ngày không hoạt động'];
    const rows = data.map(item => [
      item.productId,
      `"${item.name.replace(/"/g, '""')}"`,
      item.sku,
      item.price,
      item.currentStock,
      item.lastMovementDate || 'Chưa có biến động',
      item.daysInactive
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bao_cao_ton_kho_cham_bien_dong_${daysInactive}ngay.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text className="font-semibold">{text}</Text>
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text: string) => <Tag color="cyan">{text}</Tag>
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => formatVND(value),
      align: 'right' as const
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'right' as const
    },
    {
      title: 'Ngày biến động cuối',
      dataIndex: 'lastMovementDate',
      key: 'lastMovementDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : <span className="text-gray-400">Không có biến động</span>
    },
    {
      title: 'Số ngày bất động',
      dataIndex: 'daysInactive',
      key: 'daysInactive',
      render: (days: number) => {
        let color = 'green';
        if (days >= 90) color = 'red';
        else if (days >= 60) color = 'orange';
        return <Tag color={color} className="font-bold">{days} ngày</Tag>;
      },
      align: 'center' as const
    }
  ];

  return (
    <PageContainer title="Báo cáo hàng tồn lâu ngày chậm biến động">
      <Space direction="vertical" size="large" className="w-full">
        <Card bordered={false} className="shadow-sm rounded-xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Space align="center" size="middle">
              <CalendarOutlined style={{ fontSize: 18 }} className="text-gray-400" />
              <span className="font-medium text-gray-700">Ngưỡng không hoạt động:</span>
              <Radio.Group value={daysInactive} onChange={(e) => setDaysInactive(e.target.value)}>
                <Radio.Button value={30}>30 ngày</Radio.Button>
                <Radio.Button value={60}>60 ngày</Radio.Button>
                <Radio.Button value={90}>90 ngày</Radio.Button>
              </Radio.Group>
            </Space>
            
            <Button 
              type="primary" 
              icon={<FileExcelOutlined />} 
              onClick={handleExportCsv}
              disabled={!data || data.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg"
            >
              Xuất CSV/Excel
            </Button>
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl">
          <Table 
            columns={columns} 
            dataSource={data || []} 
            loading={isLoading} 
            rowKey="productId"
            pagination={{ pageSize: 10 }}
            className="custom-table"
          />
        </Card>
      </Space>
    </PageContainer>
  );
};

export default SlowMovingReportPage;
