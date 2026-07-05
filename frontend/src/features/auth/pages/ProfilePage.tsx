import { useRef } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Space, 
  Tag, 
  message, 
  Typography 
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  LockOutlined, 
  UploadOutlined,
  MailOutlined
} from '@ant-design/icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import { useMutation } from '@tanstack/react-query';

const { Title, Text } = Typography;

export const ProfilePage = () => {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string; phone?: string }) => {
      // Find role IDs for update
      // Since profile update is for self, the backend might only update allowed fields
      // But user service update takes UserUpdateRequest which requires roleIds.
      // Wait, we can implement a self-update endpoint or use the general update
      // To be safe, we can send a PUT request to /users/{id}
      // But wait! Users are not allowed to change their own roles.
      // So we can send their current roles to keep them unchanged.
      // Wait, user details contains roles name (strings). To update, we need role IDs.
      // Actually, let's look at what we implemented in backend:
      // In UserController, we have PUT /users/{id} (needs roleIds)
      // But we can check if we need a specific self-update endpoint.
      // If we use PUT /users/{id}, we need to send their current roles. Let's make sure we can get their role IDs.
      // Wait! Is there another way? In UserController, we only have PUT /users/{id}.
      // If a normal user tries to call PUT /users/{id}, they will be BLOCKED by the dynamic permission manager
      // because they don't have PUT:/api/users/{id} permission!
      // This is a crucial security detail! Normal users can't edit other users, and can't use the admin update endpoint on themselves if they don't have permission.
      // Oh! So we should check: does the backend support updating own profile?
      // In the backend UserController, we only mapped:
      // - PUT /users/{id}
      // - GET /users/me
      // - POST /users/avatar
      // - POST /users/change-password
      // Wait, if a user wants to update their own profile details (Full Name, Phone), how do they do it?
      // We should have a PUT /users/me endpoint in UserController!
      // Let's check: did we implement PUT /users/me?
      // No, we didn't implement it yet!
      // This is a great catch! Let's implement PUT /users/me in the backend so users can update their own profile details without needing administrative permissions!
      // Let's do that! But first, let's design what we will write in the frontend for it:
      // We can call `apiClient.put('/users/me', data)` which maps to a new endpoint we will add to UserController.
      // That is extremely secure and clean!
      return userService.updateMe(data);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update user state in auth store
        setAuth(accessToken!, refreshToken!, {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          phone: response.data.phone,
          avatarUrl: response.data.avatarUrl,
          roles: response.data.roles,
          permissions: response.data.permissions
        });
        message.success('Cập nhật thông tin cá nhân thành công');
      }
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(accessToken!, refreshToken!, {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          phone: response.data.phone,
          avatarUrl: response.data.avatarUrl,
          roles: response.data.roles,
          permissions: response.data.permissions
        });
        message.success('Cập nhật ảnh đại diện thành công');
      }
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      message.success('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    }
  });

  const handleProfileSubmit = async () => {
    try {
      const values = await profileForm.validateFields();
      updateProfileMutation.mutate({
        fullName: values.fullName,
        phone: values.phone
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      changePasswordMutation.mutate({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size and type
      if (!file.type.startsWith('image/')) {
        message.error('Vui lòng chỉ tải lên file hình ảnh');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        message.error('Dung lượng hình ảnh không được vượt quá 2MB');
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin cá nhân',
      children: (
        <Form 
          form={profileForm} 
          layout="vertical" 
          onFinish={handleProfileSubmit}
          initialValues={{
            fullName: user?.fullName,
            phone: user?.phone
          }}
          className="max-w-md mt-4"
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên' },
              { max: 150, message: 'Họ tên không quá 150 ký tự' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ max: 20, message: 'Số điện thoại không quá 20 ký tự' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" size="large" />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={updateProfileMutation.isPending}
              style={{ borderRadius: 8 }}
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      children: (
        <Form 
          form={passwordForm} 
          layout="vertical" 
          onFinish={handlePasswordSubmit}
          className="max-w-md mt-4"
        >
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" size="large" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu mới tối thiểu từ 8 ký tự trở lên' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" size="large" />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={changePasswordMutation.isPending}
              style={{ borderRadius: 8 }}
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <PageContainer title="Thông tin cá nhân">
      <Row gutter={[24, 24]}>
        {/* Left column - Avatar and summary */}
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm rounded-xl text-center p-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar 
                  size={120} 
                  src={user?.avatarUrl} 
                  icon={<UserOutlined />} 
                  className="bg-blue-500 shadow-md border-4 border-white transition-all duration-300 group-hover:brightness-75" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <UploadOutlined className="text-white text-2xl" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              <div>
                <Title level={4} style={{ margin: 0 }}>{user?.fullName}</Title>
                <Text type="secondary" className="text-xs">{user?.email}</Text>
              </div>

              <Space size={[0, 4]} wrap className="justify-center">
                {user?.roles.map(role => (
                  <Tag key={role} color={role === 'ADMIN' ? 'red' : 'blue'} style={{ borderRadius: 6, fontWeight: 500 }}>
                    {role}
                  </Tag>
                ))}
              </Space>

              <div className="w-full pt-4 border-t border-gray-100 text-left text-gray-500 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <MailOutlined />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneOutlined />
                    <span>{user?.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* Right column - Tabs for forms */}
        <Col xs={24} md={16}>
          <Card bordered={false} className="shadow-sm rounded-xl min-h-[400px]">
            <Tabs defaultActiveKey="info" items={tabItems} size="large" />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ProfilePage;
