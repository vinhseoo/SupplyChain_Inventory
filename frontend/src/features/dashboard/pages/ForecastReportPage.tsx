import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Table, Card, Button, Radio, Space, Typography, Tag, Progress } from 'antd';
import { FileExcelOutlined, AlertOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { useStockDepletionForecast } from '../hooks/useAnalytics';

const { Text } = Typography;

export const ForecastReportPage: FC = () => {
  const [alertDaysFilter, setAlertDaysFilter] = useState<number>(30);
  const { data, isLoading } = useStockDepletionForecast(100.0); // Fetch up to 100 days depletion

  // Filter client-side for immediate filter switching
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (alertDaysFilter === 999) return data;
    return data.filter(item => item.daysToOut <= alertDaysFilter);
  }, [data, alertDaysFilter]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredData || filteredData.length === 0) return;
    const headers = ['Mã sản phẩm', 'Tên sản phẩm', 'SKU', 'Tồn kho hiện tại', 'Tốc độ tiêu thụ hàng ngày', 'Dự báo số ngày hết hàng'];
    const rows = filteredData.map(item => [
      item.productId,
      `"${item.name.replace(/"/g, '""')}"`,
      item.sku,
      item.currentStock,
      item.avgDailyConsumption,
      item.daysToOut === 9999 ? 'Không có tiêu thụ' : item.daysToOut
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bao_cao_du_bao_het_hang_${alertDaysFilter === 999 ? 'tat_ca' : alertDaysFilter + 'ngay'}.csv`);
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
      title: 'Tồn kho hiện tại',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'right' as const,
      render: (stock: number) => <span className="font-bold">{stock}</span>
    },
    {
      title: 'Tiêu thụ trung bình/ngày',
      dataIndex: 'avgDailyConsumption',
      key: 'avgDailyConsumption',
      align: 'right' as const,
      render: (rate: number) => rate > 0 ? <span>{rate.toFixed(2)}/ngày</span> : <span className="text-gray-400">0/ngày</span>
    },
    {
      title: 'Số ngày cạn kho dự tính',
      dataIndex: 'daysToOut',
      key: 'daysToOut',
      align: 'center' as const,
      render: (days: number) => {
        if (days >= 9999) {
          return <span className="text-gray-400">Không biến động (An toàn)</span>;
        }
        let color = 'green';
        let statusText = 'An toàn';
        if (days <= 7) {
          color = 'red';
          statusText = 'Nguy cơ cạn kiệt (<7d)';
        } else if (days <= 15) {
          color = 'orange';
          statusText = 'Cảnh báo hết hàng (<15d)';
        } else if (days <= 30) {
          color = 'gold';
          statusText = 'Cần bổ sung (<30d)';
        }

        return (
          <Space direction="vertical" align="center" size={1} className="w-full">
            <Tag color={color} className="font-bold">{days} ngày</Tag>
            <span className="text-[10px] text-gray-400 font-medium">{statusText}</span>
          </Space>
        );
      }
    },
    {
      title: 'Mức độ cấp bách',
      key: 'urgency',
      width: 150,
      render: (_: any, record: any) => {
        if (record.daysToOut >= 9999) {
          return <Progress percent={100} size="small" strokeColor="#10B981" showInfo={false} />;
        }
        const percent = Math.min(100, Math.round((record.daysToOut / 30) * 100));
        let strokeColor = '#10B981';
        if (record.daysToOut <= 7) strokeColor = '#EF4444';
        else if (record.daysToOut <= 15) strokeColor = '#F59E0B';
        else if (record.daysToOut <= 30) strokeColor = '#EAB308';
        
        return <Progress percent={percent} size="small" strokeColor={strokeColor} format={() => `${record.daysToOut} ngày`} />;
      }
    }
  ];

  return (
    <PageContainer title="Báo cáo dự báo thời gian cạn kho">
      <Space direction="vertical" size="large" className="w-full">
        <Card bordered={false} className="shadow-sm rounded-xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Space align="center" size="middle">
              <AlertOutlined style={{ fontSize: 18 }} className="text-gray-400" />
              <span className="font-medium text-gray-700">Lọc cấp bách:</span>
              <Radio.Group value={alertDaysFilter} onChange={(e) => setAlertDaysFilter(e.target.value)}>
                <Radio.Button value={7}>Dưới 7 ngày</Radio.Button>
                <Radio.Button value={15}>Dưới 15 ngày</Radio.Button>
                <Radio.Button value={30}>Dưới 30 ngày</Radio.Button>
                <Radio.Button value={999}>Tất cả</Radio.Button>
              </Radio.Group>
            </Space>
            
            <Button 
              type="primary" 
              icon={<FileExcelOutlined />} 
              onClick={handleExportCsv}
              disabled={filteredData.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg"
            >
              Xuất CSV/Excel
            </Button>
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-xl">
          <Table 
            columns={columns} 
            dataSource={filteredData} 
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

export default ForecastReportPage;
