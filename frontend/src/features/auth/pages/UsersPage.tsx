import { Card, Tabs } from 'antd';
import { PageContainer } from '@/components/layout/PageContainer';
import { UserList } from '../components/UserList';
import { RoleList } from '../components/RoleList';
import { UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

export const UsersPage = () => {
  const tabItems = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          Quản lý Người dùng
        </span>
      ),
      children: <UserList />,
    },
    {
      key: 'roles',
      label: (
        <span>
          <SafetyCertificateOutlined />
          Vai trò & Phân quyền
        </span>
      ),
      children: <RoleList />,
    },
  ];

  return (
    <PageContainer title="Người dùng & Quyền hạn">
      <Card bordered={false} className="shadow-sm rounded-xl">
        <Tabs defaultActiveKey="users" items={tabItems} size="large" />
      </Card>
    </PageContainer>
  );
};

export default UsersPage;
