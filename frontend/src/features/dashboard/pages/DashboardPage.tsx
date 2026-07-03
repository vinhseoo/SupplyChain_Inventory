import type { FC } from 'react';
import { Typography, Row, Col, Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InboxOutlined, SyncOutlined, AlertOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';

const { Title } = Typography;

const DashboardPage: FC = () => {
  return (
    <PageContainer title="Dashboard Tổng quan">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-shadow duration-300">
            <Statistic
              title="Tổng Giá Trị Tồn Kho"
              value={1254300000}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<SafetyCertificateOutlined />}
              suffix="₫"
            />
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-green-500 font-semibold"><ArrowUpOutlined /> 12%</span> so với tháng trước
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-shadow duration-300">
            <Statistic
              title="Số Mặt Hàng Đang Quản Lý"
              value={324}
              valueStyle={{ color: '#1677ff' }}
              prefix={<InboxOutlined />}
            />
            <div className="mt-2 text-xs text-gray-500">
              Mã SKUs hoạt động trong kho
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-shadow duration-300">
            <Statistic
              title="Giao Dịch Hôm Nay"
              value={18}
              valueStyle={{ color: '#faad14' }}
              prefix={<SyncOutlined spin />}
            />
            <div className="mt-2 text-xs text-gray-500">
              12 Nhập kho | 6 Xuất kho
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-shadow duration-300">
            <Statistic
              title="Sản Phẩm Cảnh Báo Tồn"
              value={5}
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertOutlined />}
            />
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-red-500 font-semibold"><ArrowDownOutlined /> 5 sản phẩm</span> dưới mức tối thiểu
            </div>
          </Card>
        </Col>
      </Row>

      <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <Title level={4}>Hệ thống Quản lý & Phân tích Chuỗi Cung ứng (SCIM)</Title>
        <p className="text-gray-600 mt-2">
          Chào mừng bạn đến với hệ thống quản trị SCIM. Đây là giao diện điều khiển trung tâm giúp giám sát và quản lý các hoạt động kho bãi, luồng hàng nhập xuất, kiểm kê mã vạch, và phân tích các chỉ số vận hành chuỗi cung ứng theo thời gian thực.
        </p>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
