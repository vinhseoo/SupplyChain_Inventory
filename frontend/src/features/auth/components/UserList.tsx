import { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Select, 
  Tag, 
  message, 
  Popconfirm,
  Tooltip
} from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  KeyOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { useAuthStore } from '@/stores/authStore';
import type { UserResponse, UserCreateRequest, UserUpdateRequest, ResetPasswordRequest } from '@/types';
import dayjs from 'dayjs';

export const UserList = () => {
  const { hasPermission, user: currentUser, setAuth, accessToken, refreshToken } = useAuthStore();
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  // Fetch Users
  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      const response = await userService.getAll({ search });
      return response.data;
    }
  });

  // Fetch Active Roles (for Select option)
  const { data: activeRoles, isLoading: isActiveRolesLoading } = useQuery({
    queryKey: ['activeRoles'],
    queryFn: async () => {
      const response = await roleService.getAllActive();
      return response.data || [];
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      message.success('Tạo người dùng thành công');
      refetchUsers();
      handleCancelCreate();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateRequest }) => userService.update(id, data),
    onSuccess: (response) => {
      message.success('Cập nhật người dùng thành công');
      refetchUsers();
      if (response.data && response.data.id === currentUser?.id) {
        setAuth(accessToken!, refreshToken!, {
          ...currentUser,
          fullName: response.data.fullName,
          phone: response.data.phone,
          roles: response.data.roles,
          permissions: currentUser.permissions
        });
      }
      handleCancelEdit();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      message.success('Khoá tài khoản người dùng thành công');
      refetchUsers();
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResetPasswordRequest }) => userService.resetPassword(id, data),
    onSuccess: () => {
      message.success('Đặt lại mật khẩu thành công');
      refetchUsers();
      handleCancelReset();
    }
  });

  const handleOpenCreate = () => {
    createForm.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleOpenEdit = (user: UserResponse) => {
    setSelectedUser(user);
    // Find active role IDs based on user role names
    // Note: We match role names to retrieve their IDs.
    const userRoleIds = activeRoles
      ? activeRoles.filter(r => user.roles.includes(r.name)).map(r => r.id)
      : [];

    editForm.setFieldsValue({
      fullName: user.fullName,
      phone: user.phone,
      roleIds: userRoleIds,
    });
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    editForm.resetFields();
  };

  const handleOpenReset = (user: UserResponse) => {
    setSelectedUser(user);
    resetForm.resetFields();
    setIsResetModalOpen(true);
  };

  const handleCancelReset = () => {
    setIsResetModalOpen(false);
    setSelectedUser(null);
    resetForm.resetFields();
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      createMutation.mutate(values as UserCreateRequest);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      if (!selectedUser) return;
      const values = await editForm.validateFields();
      updateMutation.mutate({ id: selectedUser.id, data: values as UserUpdateRequest });
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetSubmit = async () => {
    try {
      if (!selectedUser) return;
      const values = await resetForm.validateFields();
      resetPasswordMutation.mutate({ id: selectedUser.id, data: values as ResetPasswordRequest });
    } catch (error) {
      console.error(error);
    }
  };

  const baseColumns: TableColumnsType<UserResponse> = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (fullName: any) => <span className="font-semibold text-gray-800">{fullName}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: any) => phone || <span className="text-gray-400">Chưa cập nhật</span>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: any) => (
        <Space size={[0, 4]} wrap>
          {roles.map((role: string) => (
            <Tag key={role} color={role === 'ADMIN' ? 'red' : 'blue'} style={{ borderRadius: 6 }}>
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: any) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 4 }}>
          {isActive ? 'Hoạt động' : 'Khoá'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: any) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];
 
  const columns: TableColumnsType<UserResponse> = [...baseColumns];

  const canEdit = hasPermission('PUT:/api/users/{id}');
  const canReset = hasPermission('POST:/api/users/{id}/reset-password');
  const canDelete = hasPermission('DELETE:/api/users/{id}');

  if (canEdit || canReset || canDelete) {
    columns.push({
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: UserResponse) => (
        <Space size="middle">
          {canEdit && (
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#1677ff' }} />} 
                onClick={() => handleOpenEdit(record)} 
              />
            </Tooltip>
          )}
          {canReset && (
            <Tooltip title="Đặt lại mật khẩu">
              <Button 
                type="text" 
                icon={<KeyOutlined style={{ color: '#faad14' }} />} 
                onClick={() => handleOpenReset(record)} 
              />
            </Tooltip>
          )}
          {record.isActive && record.email !== 'admin@scim.local' && canDelete && (
            <Popconfirm
              title="Bạn muốn khoá tài khoản này?"
              description="Thao tác này sẽ vô hiệu hoá khả năng đăng nhập của người dùng."
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => deleteMutation.mutate(record.id)}
            >
              <Tooltip title="Khoá tài khoản">
                <Button 
                  type="text" 
                  danger
                  icon={<DeleteOutlined />} 
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs">
        <Input
          placeholder="Tìm kiếm người dùng..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300, borderRadius: 8 }}
          allowClear
        />
        {hasPermission('POST:/api/users') && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleOpenCreate}
            style={{ borderRadius: 8 }}
          >
            Thêm người dùng
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={usersData?.content || []} 
        rowKey="id"
        loading={isUsersLoading}
        pagination={{
          total: usersData?.totalElements || 0,
          pageSize: usersData?.size || 20,
          current: (usersData?.page || 0) + 1,
          showSizeChanger: false,
        }}
        className="shadow-xs rounded-xl overflow-hidden"
      />

      {/* Add User Modal */}
      <Modal
        title="Thêm mới Người dùng"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={handleCancelCreate}
        okText="Tạo mới"
        cancelText="Hủy"
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical" className="mt-4">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
              { max: 150, message: 'Email không quá 150 ký tự' }
            ]}
          >
            <Input placeholder="user@scim.local" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên' },
              { max: 150, message: 'Họ tên không quá 150 ký tự' }
            ]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mặc định" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ max: 20, message: 'Số điện thoại không quá 20 ký tự' }]}
          >
            <Input placeholder="09xxxxxxxx" />
          </Form.Item>

          <Form.Item
            name="roleIds"
            label="Vai trò (Roles)"
            rules={[{ required: true, message: 'Vui lòng gán ít nhất một vai trò' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn vai trò..."
              loading={isActiveRolesLoading}
              options={activeRoles?.map(r => ({ label: r.name, value: r.id }))}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Cập nhật Người dùng"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={handleCancelEdit}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <div className="mb-4">
            <span className="block text-gray-400 text-xs">Email tài khoản:</span>
            <span className="font-semibold text-gray-800">{selectedUser?.email}</span>
          </div>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên' },
              { max: 150, message: 'Họ tên không quá 150 ký tự' }
            ]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ max: 20, message: 'Số điện thoại không quá 20 ký tự' }]}
          >
            <Input placeholder="09xxxxxxxx" />
          </Form.Item>

          <Form.Item
            name="roleIds"
            label="Vai trò (Roles)"
            rules={[{ required: true, message: 'Vui lòng gán ít nhất một vai trò' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn vai trò..."
              loading={isActiveRolesLoading}
              options={activeRoles?.map(r => ({ label: r.name, value: r.id }))}
              style={{ width: '100%' }}
              disabled={selectedUser?.email === 'admin@scim.local'}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title="Đặt lại mật khẩu người dùng"
        open={isResetModalOpen}
        onOk={handleResetSubmit}
        onCancel={handleCancelReset}
        okText="Đặt lại"
        cancelText="Hủy"
        confirmLoading={resetPasswordMutation.isPending}
      >
        <Form form={resetForm} layout="vertical" className="mt-4">
          <div className="mb-4">
            <span className="block text-gray-400 text-xs font-medium">Đặt lại mật khẩu cho tài khoản:</span>
            <span className="font-semibold text-gray-800">{selectedUser?.fullName} ({selectedUser?.email})</span>
          </div>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
