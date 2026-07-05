import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '@/types';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [form] = Form.useForm<LoginRequest>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        
        // Map user properties to store format
        setAuth(accessToken, refreshToken, {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          roles: user.roles,
          permissions: user.permissions
        });

        message.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        message.error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Errors are already handled and toasted by apiClient interceptor, but we catch to reset loading
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.25)',
          background: 'rgba(255, 255, 255, 0.95)',
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ marginBottom: 4, color: '#1e3a8a' }}>
              📦 SCIM SYSTEM
            </Title>
            <Text type="secondary">Cung ứng & Quản lý tồn kho doanh nghiệp</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            size="large"
            style={{ textAlign: 'left' }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                style={{ 
                  height: 44, 
                  borderRadius: 8, 
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: 'none'
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Tài khoản mặc định: admin@scim.local / Admin@123
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
