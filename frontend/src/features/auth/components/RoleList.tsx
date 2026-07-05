import { useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Radio, 
  Collapse, 
  Checkbox, 
  Tag, 
  Alert, 
  message, 
  Popconfirm,
  Tooltip,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  InfoCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';
import type { RoleResponse, PermissionResponse, RoleRequest } from '@/types';

export const RoleList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [form] = Form.useForm();
  
  // Custom states for permission checkbox selection
  const [roleType, setRoleType] = useState<'ALL' | 'CUSTOM'>('CUSTOM');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  // Fetch Roles
  const { data: rolesData, isLoading: isRolesLoading } = useQuery({
    queryKey: ['roles', search],
    queryFn: async () => {
      const response = await roleService.getAll({ search });
      return response.data;
    }
  });

  // Fetch all permissions (for mapping)
  const { data: permissions, isLoading: isPermissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await permissionService.getAll();
      return response.data || [];
    },
    enabled: isModalOpen // Fetch only when modal opens
  });

  // Group permissions by apiGroup for rendering
  const groupedPermissions = useMemo<Record<string, PermissionResponse[]>>(() => {
    if (!permissions) return {};
    return permissions.reduce((acc: Record<string, PermissionResponse[]>, perm) => {
      const group = perm.apiGroup || 'Khác';
      if (!acc[group]) acc[group] = [];
      acc[group].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      message.success('Tạo vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      handleCancel();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleRequest }) => roleService.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      handleCancel();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      message.success('Khoá vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const handleOpenModal = (role?: RoleResponse) => {
    if (role) {
      setEditingRole(role);
      setRoleType(role.type);
      setSelectedPermissionIds(role.permissions.map(p => p.id));
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        type: role.type,
      });
    } else {
      setEditingRole(null);
      setRoleType('CUSTOM');
      setSelectedPermissionIds([]);
      form.setFieldsValue({
        name: '',
        description: '',
        type: 'CUSTOM',
      });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    form.resetFields();
    setSelectedPermissionIds([]);
    setRoleType('CUSTOM');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: RoleRequest = {
        name: values.name,
        description: values.description,
        type: values.type,
        permissionIds: values.type === 'CUSTOM' ? selectedPermissionIds : []
      };

      if (editingRole) {
        updateMutation.mutate({ id: editingRole.id, data: payload });
      } else {
        createMutation.mutate(payload);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissionIds(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissionIds(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleGroupSelectAll = (groupPermissions: PermissionResponse[], checked: boolean) => {
    const groupIds = groupPermissions.map(p => p.id);
    if (checked) {
      setSelectedPermissionIds(prev => [...new Set([...prev, ...groupIds])]);
    } else {
      setSelectedPermissionIds(prev => prev.filter(id => !groupIds.includes(id)));
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'green';
      case 'POST': return 'blue';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      case 'PATCH': return 'cyan';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Loại vai trò',
      dataIndex: 'type',
      key: 'type',
      render: (type: 'ALL' | 'CUSTOM') => {
        const isAll = type === 'ALL';
        return (
          <Tag color={isAll ? 'purple-inverse' : 'blue-inverse'} style={{ borderRadius: 6, fontWeight: 500 }}>
            {isAll ? 'ALL (Toàn quyền)' : 'CUSTOM (Tuỳ chọn)'}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 4 }}>
          {isActive ? 'Hoạt động' : 'Khoá'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: RoleResponse) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1677ff' }} />} 
              onClick={() => handleOpenModal(record)} 
            />
          </Tooltip>
          {record.isActive && record.name !== 'ADMIN' && (
            <Popconfirm
              title="Bạn chắc chắn muốn khoá vai trò này?"
              description="Thao tác này sẽ vô hiệu hoá vai trò trong hệ thống."
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => deleteMutation.mutate(record.id)}
            >
              <Tooltip title="Khoá vai trò">
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
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs">
        <Input
          placeholder="Tìm kiếm vai trò..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300, borderRadius: 8 }}
          allowClear
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleOpenModal()}
          style={{ borderRadius: 8 }}
        >
          Thêm vai trò
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={rolesData?.content || []} 
        rowKey="id"
        loading={isRolesLoading}
        pagination={{
          total: rolesData?.totalElements || 0,
          pageSize: rolesData?.size || 20,
          current: (rolesData?.page || 0) + 1,
          showSizeChanger: false,
        }}
        className="shadow-xs rounded-xl overflow-hidden"
      />

      <Modal
        title={editingRole ? 'Cập nhật Vai trò' : 'Thêm mới Vai trò'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={720}
        okText={editingRole ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        style={{ top: 40 }}
      >
        <Form 
          form={form} 
          layout="vertical" 
          className="mt-4"
          initialValues={{ type: 'CUSTOM' }}
        >
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[
              { required: true, message: 'Vui lòng nhập tên vai trò' },
              { max: 50, message: 'Tên không quá 50 ký tự' }
            ]}
          >
            <Input placeholder="Ví dụ: WAREHOUSE_STAFF" disabled={!!editingRole && editingRole.name === 'ADMIN'} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ max: 255, message: 'Mô tả không quá 255 ký tự' }]}
          >
            <Input.TextArea placeholder="Mô tả chi tiết quyền hạn vai trò này..." rows={2} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại vai trò"
            rules={[{ required: true }]}
          >
            <Radio.Group 
              onChange={(e) => setRoleType(e.target.value)} 
              value={roleType}
              disabled={!!editingRole && editingRole.name === 'ADMIN'}
            >
              <Radio.Button value="CUSTOM">Tùy chỉnh (CUSTOM)</Radio.Button>
              <Radio.Button value="ALL">Toàn quyền (ALL)</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Permission selection display */}
          {roleType === 'ALL' && (
            <Alert
              message="Chế độ Toàn quyền (ALL)"
              description="Vai trò này mặc định sở hữu toàn bộ quyền hạn trong hệ thống. Dưới đây là danh sách chi tiết các quyền tự động được kích hoạt."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="mb-4 rounded-lg"
            />
          )}

          <div className="mt-4">
            <span className="block mb-2 font-medium text-gray-700">Phân quyền chi tiết (API Endpoints):</span>
            {isPermissionsLoading ? (
              <div className="text-center py-4 text-gray-400">Đang tải danh sách phân quyền...</div>
            ) : (
              <Collapse 
                size="small" 
                className="bg-white rounded-lg overflow-hidden border border-gray-200"
              >
                {Object.keys(groupedPermissions).map((group, idx) => {
                  const groupPerms = groupedPermissions[group];
                  const groupIds = groupPerms.map(p => p.id);
                  
                  // In ALL mode, everything is checked
                  const isAllGroupChecked = roleType === 'ALL' || groupIds.every(id => selectedPermissionIds.includes(id));
                  const isGroupPartiallyChecked = roleType !== 'ALL' && groupIds.some(id => selectedPermissionIds.includes(id)) && !isAllGroupChecked;

                  return (
                    <Collapse.Panel 
                      header={
                        <div className="flex justify-between items-center w-full pr-4" onClick={(e) => e.stopPropagation()}>
                          <span className="font-semibold text-gray-700">{group}</span>
                          <Checkbox
                            checked={isAllGroupChecked}
                            indeterminate={isGroupPartiallyChecked}
                            onChange={(e) => handleGroupSelectAll(groupPerms, e.target.checked)}
                            disabled={roleType === 'ALL' || editingRole?.name === 'ADMIN'}
                          >
                            Chọn tất cả
                          </Checkbox>
                        </div>
                      } 
                      key={idx}
                    >
                      <Row gutter={[16, 8]}>
                        {groupPerms.map((perm) => (
                          <Col span={24} key={perm.id} className="py-1 border-b border-gray-100 last:border-b-0">
                            <Checkbox
                              checked={roleType === 'ALL' ? true : selectedPermissionIds.includes(perm.id)}
                              onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                              disabled={roleType === 'ALL' || editingRole?.name === 'ADMIN'}
                            >
                              <Space size="small">
                                <Tag color={getMethodColor(perm.method)} style={{ minWidth: 60, textAlign: 'center', borderRadius: 4 }}>
                                  {perm.method}
                                </Tag>
                                <span className="text-gray-800 font-mono text-xs">{perm.path}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-600 font-medium">{perm.description}</span>
                              </Space>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Collapse.Panel>
                  );
                })}
              </Collapse>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};
