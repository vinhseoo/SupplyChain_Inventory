import { useState } from 'react';
import type { FC } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  DatabaseOutlined,
  SolutionOutlined,
  BarcodeOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content } = Layout;

export const AppLayout: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuthStore();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'master-data',
      icon: <DatabaseOutlined />,
      label: 'Dữ liệu danh mục',
      children: [
        { key: '/suppliers', label: 'Nhà cung cấp', icon: <ShopOutlined /> },
        { key: '/warehouses', label: 'Kho & Vị trí', icon: <GlobalOutlined /> },
        { key: '/products', label: 'Sản phẩm/SKUs', icon: <BarcodeOutlined /> },
      ],
    },
    {
      key: 'inventory',
      icon: <SolutionOutlined />,
      label: 'Quản lý kho',
      children: [
        { key: '/inventory/transactions', label: 'Giao dịch kho' },
        { key: '/inventory/stock-levels', label: 'Tồn kho hiện tại' },
        { key: '/inventory/stock-card', label: 'Thẻ kho (Stock Card)', icon: <SwapOutlined /> },
      ],
    },
    {
      key: 'stocktake-group',
      icon: <BarcodeOutlined />,
      label: 'Kiểm kê & QR Code',
      children: [
        { key: '/stocktake/sessions', label: 'Đợt kiểm kê kho' },
        { key: '/stocktake/adjustments', label: 'Phiếu điều chỉnh tồn' },
        { key: '/stocktake/qr-print', label: 'In nhãn decal QR Code' },
      ]
    },
    {
      key: 'settings-group',
      icon: <SettingOutlined />,
      label: 'Hệ thống',
      children: [
        { key: '/users', label: 'Người dùng & Quyền', icon: <UserOutlined /> },
        { key: '/settings', label: 'Cấu hình chung' },
      ],
    },
  ];

  // Helper to filter menu items recursively based on permissions
  const filterMenuByPermissions = (items: any[]): any[] => {
    return items
      .map(item => {
        if (item.children) {
          const filteredChildren = filterMenuByPermissions(item.children);
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        if (item.key === '/users') {
          return hasPermission('GET:/api/users') || hasPermission('GET:/api/roles') ? item : null;
        }
        if (item.key === '/suppliers') {
          return hasPermission('GET:/api/suppliers') ? item : null;
        }
        if (item.key === '/warehouses') {
          return hasPermission('GET:/api/warehouses') ? item : null;
        }
        if (item.key === '/products') {
          return hasPermission('GET:/api/products') ? item : null;
        }
        if (item.key === '/inventory/transactions') {
          return hasPermission('GET:/api/inventory/transactions') ? item : null;
        }
        if (item.key === '/inventory/stock-levels') {
          return hasPermission('GET:/api/inventory/stock-levels') ? item : null;
        }
        if (item.key === '/inventory/stock-card') {
          return hasPermission('GET:/api/inventory/stock-levels/history') ? item : null;
        }
        if (item.key === '/stocktake/sessions') {
          return hasPermission('GET:/api/stocktake/sessions') ? item : null;
        }
        if (item.key === '/stocktake/adjustments') {
          return hasPermission('GET:/api/stock-adjustments') ? item : null;
        }
        if (item.key === '/stocktake/qr-print') {
          return hasPermission('GET:/api/inventory/stock-levels') ? item : null;
        }
        return item;
      })
      .filter(Boolean);
  };

  const filteredMenuItems = filterMenuByPermissions(menuItems);

  const userDropdownItems = [
    {
      key: '/profile',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
    },
    {
      key: '/settings',
      label: 'Cài đặt tài khoản',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} className="shadow-lg">
        <div className="h-16 flex items-center justify-center bg-[#001529]">
          <span className="text-white font-bold text-lg tracking-wider">
            {collapsed ? '📦' : '📦 SCIM System'}
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['master-data', 'inventory', 'settings-group']}
          items={filteredMenuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout style={{ minWidth: 0 }}>
        <Header className="h-16 px-6 bg-white flex justify-between items-center border-b border-gray-200" style={{ padding: '0 24px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg w-10 h-10 flex items-center justify-center"
          />
          <div className="flex items-center gap-6">
            <Badge count={5} size="small" className="cursor-pointer">
              <BellOutlined className="text-xl text-gray-600 hover:text-blue-600 transition-colors" />
            </Badge>

            <Dropdown menu={{ items: userDropdownItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar src={user?.avatarUrl} icon={<UserOutlined />} className="bg-blue-500" />
                <span className="font-medium text-gray-700 hidden sm:inline">{user?.fullName || 'Tài khoản'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="min-h-[calc(100vh-64px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
