import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Row, Col, Card, Spin, Tag, List, Badge } from 'antd';
import {
  InboxOutlined,
  SyncOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  useKpis,
  useAbcClassification,
  useMovementTrend,
  useRealTimeStock
} from '../hooks/useAnalytics';
import type { StockChangeMessage } from '../hooks/useAnalytics';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DashboardPage: FC = () => {
  const { data: kpis, isLoading: isKpisLoading } = useKpis();
  const { data: abcData, isLoading: isAbcLoading } = useAbcClassification();
  const { data: trendData, isLoading: isTrendLoading } = useMovementTrend(30);

  // Real-time stock change logs state
  const [realTimeLogs, setRealTimeLogs] = useState<StockChangeMessage[]>([]);

  useRealTimeStock((newLog) => {
    setRealTimeLogs((prev) => {
      // Keep only latest 5 changes and prevent duplicate key warnings
      const filtered = prev.filter(item => item.productId !== newLog.productId);
      return [newLog, ...filtered].slice(0, 5);
    });
  });

  // Calculate ABC structure summary for Pie Chart
  const pieChartData = useMemo(() => {
    if (!abcData) return [];
    const groups = abcData.reduce((acc, curr) => {
      acc[curr.abcClass] = (acc[curr.abcClass] || 0) + curr.totalValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(groups).map((key) => ({
      name: `Nhóm ${key}`,
      value: groups[key]
    }));
  }, [abcData]);

  // Format currency
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const isDataLoading = isKpisLoading || isAbcLoading || isTrendLoading;

  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải dữ liệu phân tích..." />
      </div>
    );
  }

  return (
    <PageContainer title="Dashboard Tổng quan & SSE Real-time">
      <div className="space-y-6">
        {/* KPI Cards Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300 border-l-4 border-emerald-500"
              style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Tổng Giá Trị Tồn Kho</div>
                  <div className="text-xl font-bold text-gray-800 mt-1">
                    {formatVND(kpis?.totalInventoryValue || 0)}
                  </div>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-lg">
                  <SafetyCertificateOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300 border-l-4 border-blue-500"
              style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">SKUs Hoạt Động</div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">{kpis?.totalSkus || 0}</div>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-lg">
                  <InboxOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300 border-l-4 border-amber-500"
              style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Giao Dịch Nhập/Xuat</div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">
                    {kpis?.totalInboundTransactions || 0} / {kpis?.totalOutboundTransactions || 0}
                  </div>
                </div>
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-lg">
                  <SyncOutlined spin />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300 border-l-4 border-red-500"
              style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Cảnh Báo Hoạt Động</div>
                  <div className="text-2xl font-bold text-red-600 mt-1">{kpis?.activeAlertsCount || 0}</div>
                </div>
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-lg">
                  <AlertOutlined />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts & Realtime Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="Xu hướng nhập/xuất kho 30 ngày gần nhất" className="shadow-sm rounded-xl" bordered={false}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area name="Số lượng nhập" type="monotone" dataKey="inboundQty" stroke="#10B981" fillOpacity={1} fill="url(#colorInbound)" />
                    <Area name="Số lượng xuất" type="monotone" dataKey="outboundQty" stroke="#EF4444" fillOpacity={1} fill="url(#colorOutbound)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* SSE Real-time Stock Counter */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <div className="flex justify-between items-center w-full">
                  <span>Biến động tồn thực tế (SSE)</span>
                  <Badge status="processing" text="Real-time" />
                </div>
              }
              className="shadow-sm rounded-xl h-[415px]"
              bordered={false}
            >
              {realTimeLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <SwapOutlined style={{ fontSize: 32 }} className="mb-2" />
                  <span>Đang đợi cập nhật tồn kho...</span>
                </div>
              ) : (
                <List
                  size="small"
                  dataSource={realTimeLogs}
                  renderItem={(item) => (
                    <List.Item className="bg-blue-50/20 hover:bg-blue-50/50 p-3 rounded-lg border border-blue-50 mb-2 transition-all animate-pulse">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-xs text-gray-800">{item.name}</span>
                          <Tag color="cyan" style={{ margin: 0, fontSize: 10 }}>{item.sku}</Tag>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1 text-gray-500">
                          <span>Số lượng tồn mới:</span>
                          <span className="font-bold text-blue-600 text-sm">{item.quantity}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* ABC & Pareto Classification Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="Phân cơ cấu giá trị tồn kho ABC" className="shadow-sm rounded-xl h-96" bordered={false}>
              <div className="h-64 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatVND(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card title="Phân tích Pareto tồn kho (ABC classification)" className="shadow-sm rounded-xl h-96" bordered={false}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={(abcData || []).slice(0, 10)}>
                    <CartesianGrid stroke="#f5f5f5" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} style={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tickLine={false} style={{ fontSize: 10 }} label={{ value: 'Giá trị tồn kho', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tickFormatter={(val) => `${Math.round(val * 100)}%`} tickLine={false} style={{ fontSize: 10 }} label={{ value: 'Lũy kế (%)', angle: 90, position: 'insideRight', style: { fontSize: 10 } }} />
                    <Tooltip formatter={(value: any, name: any) => name === 'Lũy kế (%)' ? `${Math.round(Number(value) * 100)}%` : formatVND(Number(value))} />
                    <Legend />
                    <Bar yAxisId="left" name="Giá trị" dataKey="totalValue" barSize={35} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" name="Lũy kế (%)" type="monotone" dataKey="cumulativePercentage" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
